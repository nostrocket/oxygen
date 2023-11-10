<script lang="ts">
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import {page} from "$app/stores";
    import {Button, Column, OverflowMenu, OverflowMenuItem, Row, SkeletonText, Tag, Tile} from "carbon-components-svelte";
    import {Chat, Unlocked, ManageProtection, PlayFilledAlt    } from "carbon-icons-svelte";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import type {NDKUserProfile} from "@nostr-dev-kit/ndk";
    import {makeHtml} from "$lib/helpers/mundane";
    import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import { nostrocketIgnitionEvent } from "../../../settings";

    let problem: Problem | undefined
    let createdBy: NDKUserProfile | undefined
    let claimedBy: NDKUserProfile | undefined

    let claimable = false

    $: {
        problem = $consensusTipState.Problems.get($page.params.id)
        claimable = (problem?.Children.size == 0 && problem.Status == "open")
    }



    $: if (Boolean(problem?.CreatedBy) && !createdBy) {
        (async () => {
            const createdByUser = $ndk.getUser({hexpubkey: problem?.CreatedBy})
            await createdByUser.fetchProfile()
            createdBy = createdByUser.profile
        })()
    }

    $: if (Boolean(problem?.ClaimedBy) && !claimedBy) {
        (async () => {
            const claimedByUser = $ndk.getUser({hexpubkey: problem?.ClaimedBy})
            await claimedByUser.fetchProfile()
            claimedBy = claimedByUser.profile
        })()
    }

function updateStatus(newStatus:string):Promise<string> {
    return new Promise<string>((resolve, reject)=>{
        if (!problem) {
            reject("problem is missing")
        }
        if (!$currentUser) {
            reject("user not logged in")
        }
        if (!$consensusTipState.RocketMap.get(nostrocketIgnitionEvent)?.isParticipant($currentUser!.pubkey)) {
            reject("current user is not in the Identity Tree")
        }
        if (newStatus == "claimed" && problem?.Status != "open") {
            reject("cannot claim a problem that isn't open")
        }
        if (newStatus == "close" && problem?.CreatedBy != $currentUser?.pubkey) {
            //todo also check if maintainer
            reject("you cannot close a problem unless you are the creator of it or a maintainer on its rocket")
        }
        if (newStatus == "patched" && (problem?.Status !== "claimed" || problem?.ClaimedBy != $currentUser?.pubkey)) {
            reject("you cannot mark this problem as patched unless you are the one who claimed it")
        }
        let e = makeEvent({kind:1972})
        e.tags.push(["e", problem!.UID, "problem"])
        e.tags.push(["status", newStatus])
        e.publish().then(()=>{console.log(e);resolve("published")}).catch((err)=>{reject(err)})
    })
}
</script>


{#if Boolean(problem)}
    <Row>
        <Column sm={12} md={9} lg={9} class="problem-content">
            <Row>
                <Column>
                    <Row>
                        <Column md={4}>
                            <h3 style="text-transform: capitalize">
                                {problem?.Title}
                            </h3>
                            <p style="color: #94a3b8">Logged by <span style="color: #fb923c">{createdBy?.name}</span></p>
                        </Column>
                        <Column md={4} class="problem-item-actions">
                            <LogNewProblemModal parent={problem}/>
                            <OverflowMenu size="sm" flipped light icon={ManageProtection} style="border: 2px solid white; margin-left: 1rem">
                                <OverflowMenuItem text="Edit" hasDivider />
                                <OverflowMenuItem text="Tag" hasDivider />
                                <OverflowMenuItem text="Print" hasDivider />
                                <OverflowMenuItem text="Share" hasDivider />
                            </OverflowMenu>
                        </Column>
                    </Row>


                </Column>
            </Row>

            <Row padding={20}>
                <Column>
                    <Tile>
                        <h5 style="padding-bottom: 15px">Summary</h5>
                        {problem?.Summary || ''}
                    </Tile>
                </Column>
            </Row>

            <Row padding={10}>
                <Column style="text-align: justify; text-justify: inter-word">{@html makeHtml(problem?.FullText)}</Column>
            </Row>
        </Column>

        <Column md={2} lg={3} class="problem-sidebar">
            <Row>
                <Column style="padding-bottom: 5px">
                    <p style="display: flex; align-items: center; text-transform: capitalize">
                        <Unlocked style={`color: ${problem?.Closed ? 'red' : 'green'}`}/>
                        &nbsp;&nbsp;
                        <span style={`color: ${problem?.Closed ? 'red' : 'green'}`}>{problem?.Closed ? 'Closed' : 'Open'}</span>
                    </p>
                </Column>
            </Row>
            <Row>
                <Column style="padding-bottom: 5px">
                    <p style="display: flex; align-items: center; text-transform: capitalize">
                        <Chat/>&nbsp;&nbsp;{problem?.Children?.size ?? 0} Sub problems
                    </p>
                </Column>
            </Row>

            <Row padding={5}>
                <Column>
                    <div style="border-bottom: 1px solid #262626; height: 5px"></div>
                </Column>
            </Row>

            <Row>
                <Column><h5>Comments</h5></Column>
            </Row>

            <Row padding>
                <Column>
                    [TODO]
                </Column>
            </Row>

            <Row padding>
                <Column><h5>Take Action</h5></Column>
            </Row>

            <Row>
                <Column>
                    <Button disabled={!claimable} icon={PlayFilledAlt} size="small" kind="primary" on:click={()=>{updateStatus("claimed").then((response)=>{console.log(response)}).catch((response)=>{console.log(response)})}}>Claim this problem and work on it now</Button>
                </Column>
            </Row>
        </Column>
    </Row>
{:else}
    <Row padding={10}>
        <Column>
            <SkeletonText heading/>
        </Column>
    </Row>
    <Row>
        <Column>
            <SkeletonText paragraph/>
        </Column>
    </Row>
{/if}

