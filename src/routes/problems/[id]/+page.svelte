<script lang="ts">
    import {page} from "$app/stores";
    import makeEvent from "$lib/helpers/eventMaker";
    import {makeHtml} from "$lib/helpers/mundane";
    import {ndk} from "$lib/stores/event_sources/relays/ndk";
    import {currentUser} from "$lib/stores/hot_resources/current-user";
    import {consensusTipState} from "$lib/stores/nostrocket_state/master_state";
    import type {Problem} from "$lib/stores/nostrocket_state/types";
    import type {NDKUserProfile} from "@nostr-dev-kit/ndk";
    import {
        Button,
        Column,
        InlineNotification,
        OverflowMenu,
        Row,
        Select,
        SelectItem,
        SelectItemGroup,
        SkeletonText,
        Tag,
        Tile,
    } from "carbon-components-svelte";
    import {ChevronDown, CloseOutline, ContainerServices, Idea, Stop, UserAvatarFilledAlt} from "carbon-icons-svelte";
    import {AcceleratedComputing, DesignLeadership} from "carbon-pictograms-svelte";
    import {get} from "svelte/store";
    import LogNewProblemModal from "../../../components/problems/LogNewProblemModal.svelte";
    import {HandleProblemEvent, hasOpenChildren} from "$lib/stores/nostrocket_state/soft_state/simplifiedProblems";
    import {rootProblem} from "../../../settings";
    import CommentsContainer from "../../../components/comments/CommentsWrapper.svelte";
    import ProblemStatus from "../../../components/problems/ProblemStatus.svelte";
    import Divider from "../../../components/Divider.svelte";

    let problem: Problem | undefined;
    let createdBy: NDKUserProfile | undefined;
    let claimedBy: NDKUserProfile | undefined;
    let selected_problem: string | undefined = undefined;

    let claimable = false;
    let statusErrorText: string | undefined = undefined;

    $: {
        problem = $consensusTipState.Problems.get($page.params.id);
        if (problem) {
            claimable = (!hasOpenChildren(problem, $consensusTipState) && problem.Status == "open");
            console.log(claimable)
        }

        if (statusErrorText) {
            setTimeout(() => {
                statusErrorText = undefined;
            }, 5000);
        }
    }

    $: if (Boolean(problem?.CreatedBy) && !createdBy) {
        (async () => {
            const createdByUser = $ndk.getUser({hexpubkey: problem?.CreatedBy});
            await createdByUser.fetchProfile();
            createdBy = createdByUser.profile;
        })();
    }

    $: if (Boolean(problem?.ClaimedBy) && !claimedBy) {
        (async () => {
            const claimedByUser = $ndk.getUser({hexpubkey: problem?.ClaimedBy});
            await claimedByUser.fetchProfile();
            claimedBy = claimedByUser.profile;
        })();
    }

    function updateStatus(newStatus: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            if (!problem) {
                reject("problem is missing");
            }
            if (!$currentUser) {
                reject("user not logged in");
            }
            let e = makeEvent({kind: 1972});
            e.tags.push(["e", problem!.UID, "problem"]);
            e.tags.push(["status", newStatus]);
            e.author = get(currentUser)!;
            let err = HandleProblemEvent(e, get(consensusTipState).Copy());
            if (err != undefined) {
                reject(err);
            } else {
                e.publish()
                    .then(() => {
                        console.log(e);
                        resolve("published");
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }
        });
    }

    const onUpdateProblemStatus = (status: string) => {
        updateStatus(status)
            .then(console.log)
            .catch((error) => {
                console.error(error);
                statusErrorText = error;
            })
    }
</script>

{#if Boolean(problem)}
    <Row>
        <Column sm={12} md={9} lg={9} class="problem-content">
            <Row>
                <Column>
                    <Row>
                        <Column>
                            <h3 style="text-transform: capitalize">
                                {problem?.Title}
                            </h3>
                        </Column>
                    </Row>
                </Column>
            </Row>

            <Row padding>
                <Column>
                    <Tile>
                        <h5 style="padding-bottom: 15px">Summary</h5>
                        {problem?.Summary || ""}
                    </Tile>
                </Column>
            </Row>

            <Row padding>
                <Column>{@html makeHtml(problem?.FullText)}</Column>
            </Row>

            <Row padding>
                <Column>
                    <CommentsContainer parentId={problem?.UID} isRoot={true}/>
                </Column>
            </Row>
        </Column>

        <Column md={2} lg={3} class="problem-sidebar">
            <Row>
                <Column style="padding-bottom: 5px">
                    <div style="display: flex; align-items: center; text-transform: capitalize">
                        {#if problem?.Status === "open" && hasOpenChildren(problem, $consensusTipState)}
                            <ProblemStatus status={'HAS OPEN CHILDREN'} color="blueviolet">
                                <ContainerServices size={20}/>
                            </ProblemStatus>
                        {/if}

                        {#if problem?.Status === "open" && !hasOpenChildren(problem, $consensusTipState)}
                            <ProblemStatus status={'OPEN AND CAN BE CLAIMED'} color="green">
                                <Idea size={20}/>
                            </ProblemStatus>
                        {/if}

                        {#if problem?.Status === "claimed"}
                            <ProblemStatus status={'CLAIMED AND IN PROGRESS'} color="orange">
                                <AcceleratedComputing style="width: 25px; height: 25px"/>
                            </ProblemStatus>
                        {/if}

                        {#if problem?.Status === "patched"}
                            <ProblemStatus status={'PATCHED AND WAITING FOR VALIDATION'} color="orange">
                                <DesignLeadership style="width: 25px; height: 25px"/>
                            </ProblemStatus>
                        {/if}

                        {#if problem?.Status === "closed"}
                            <ProblemStatus status={'CLOSED'} color="red">
                                <CloseOutline size={20}/>
                            </ProblemStatus>
                        {/if}
                    </div>
                </Column>
            </Row>

            <Row padding>
                <Column>
                    <Divider/>
                </Column>
            </Row>

            <Row>
                <Column>
                    <h5>Rockets</h5>
                    <Tag type="purple" style="margin: 10px 0">
                        {$consensusTipState.RocketMap.get(problem.Rocket)?.Name}
                    </Tag>
                </Column>
            </Row>

            <Row padding>
                <Column>
                    <Divider/>
                </Column>
            </Row>

            <Row>
                <Column>
                    <h5>People</h5>
                    <div style="display: flex; align-items: center; text-align: center; margin-top: 10px">
                        <UserAvatarFilledAlt size={20}/>
                        <p style="color: #fb923c; margin: 0 5px">{createdBy?.name}</p> <span style="color: #94a3b8">(creator)</span>
                    </div>

                    {#if problem?.Status === "claimed" || problem?.Status === "patched"}
                        <div style="display: flex; align-items: center; text-align: center; margin-top: 10px">
                            <UserAvatarFilledAlt size={20}/>
                            <p style="color: #fb923c; margin: 0 5px">{claimedBy?.name}</p>
                        </div>
                    {/if}

                    <br/><br/>
                    <div style="display: flex; align-items: center">
                        {#if claimable}
                            <Button size={'field'} on:click={() => onUpdateProblemStatus("claimed")} fullWidth
                                    style="padding: 10px; min-width: 86%">
                                Claim problem and work on it now
                            </Button>
                        {/if}
                        {#if problem?.Status === "claimed" && $currentUser?.pubkey == problem.ClaimedBy}
                            <Button size={'field'}
                                    disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
                                    on:click={() => onUpdateProblemStatus("patched")}
                                    style="padding: 10px; min-width: 86%"
                                    fullWidth
                            >
                                Mark as patched and ready for review
                            </Button>
                        {/if}
                        
                        <OverflowMenu icon={ChevronDown} flipped>
                            <Button slot="menu" kind="secondary" iconDescription="more" icon={ChevronDown} size={'field'}/>
                            <LogNewProblemModal existing={problem} button={false}/>
                        </OverflowMenu>
                        
                    </div>
                    {#if problem?.Status === "claimed"  && $currentUser?.pubkey == problem.ClaimedBy}
                        <Button
                                disabled={!(problem?.ClaimedBy === $currentUser?.pubkey)}
                                icon={Stop}
                                size="field"
                                kind="tertiary"
                                on:click={() => onUpdateProblemStatus("open")}
                                style="width: 100%; margin: 15px 0"
                        >
                            Abandon this problem
                        </Button>
                    {/if}
                    {#if problem?.Status !== "closed" && $currentUser?.pubkey == problem?.CreatedBy}
                        <Button size={'field'}
                                disabled={!(problem?.CreatedBy == $currentUser?.pubkey)}
                                on:click={() => onUpdateProblemStatus("closed")}
                                style="width: 100%; margin: 15px 0"
                                kind={problem?.Status === "patched"? "primary" : "danger"}
                                icon={CloseOutline}
                                fullWidth
                        >
                            Close this problem
                        </Button>
                    {/if}
                    <br />
                    <LogNewProblemModal parent={problem} button={true}/>
                </Column>
            </Row>


            <Row padding>
                <Column>
                    <Divider/>
                </Column>
            </Row>

            <Row>
                <Column>
                    {#if statusErrorText}
                        <InlineNotification
                                title="Error:"
                                subtitle={statusErrorText}
                                on:close={(statusErrorText = undefined)}
                        />
                    {/if}

                    {#if $currentUser?.pubkey == problem?.CreatedBy} 
                    <Row>
                        <Column>
                            <h5 style="padding-bottom: 10px">Add a child to this problem</h5>
                            <p>You should do this if there's an existing problem that is blocking this one from being
                                solved.</p>
                        </Column>
                    </Row>
                    <br/>
                    <Select hideLabel size="xl" labelText="Status" bind:selected={selected_problem} fullWidth>
                        <SelectItemGroup label="SELECT A PROBLEM THAT IS BLOCKING THIS ONE">
                            {#each $consensusTipState.Problems as [key, p]}
                                {#if key !== problem?.UID && p.Status == "open" && (p.UID != rootProblem)}
                                    <SelectItem value={key} text={p.Title}/>
                                {/if}
                            {/each}
                        </SelectItemGroup>
                    </Select>
                    <br/>
                    {#if selected_problem}
                        <Button size="field">DO IT</Button>
                    {/if}
                    
                    <Row padding>
                        <Column>
                            <Divider/>
                        </Column>
                    </Row>
                    {/if}
                    <Button kind="tertiary" on:click={()=>{console.log(problem)}}>Print this problem to the console
                    </Button>

                </Column>
            </Row>

        </Column>
    </Row>
{:else}
    <Row padding>
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

