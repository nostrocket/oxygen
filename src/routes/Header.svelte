<script>
    import {weHaveTheLead} from "$lib/consensus/votepower";
    import {BitcoinTipHeight} from "$lib/helpers/bitcoin";
    import {currentUser} from "$lib/stores/current-user";
    import {
        breakpointObserver,
        Header,
        HeaderAction,
        HeaderGlobalAction,
        HeaderNav,
        HeaderNavItem,
        HeaderNavMenu,
        HeaderPanelDivider,
        HeaderPanelLinks,
        HeaderUtilities,
        SideNav,
        SideNavItems,
        SideNavLink,
        SideNavMenu,
        SideNavMenuItem,
        SkipToContent
    } from "carbon-components-svelte";
    import {Network_1, UserAvatarFilledAlt} from "carbon-icons-svelte";
    import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
    import LoginNip07Button from "../components/LoginNIP07Button.svelte";
    import menu from "$lib/menu";
  import { defaultRelays, profileRelays } from "$lib/settings";

    const size = breakpointObserver();
    const larger = size.largerThan("md");
    let isSideNavOpen = false;
    let expandedByDefault = false;
    $: {
        isSideNavOpen = !larger;
    }

</script>

<Header
        company="NOSTROCKET:"
        platformName="Oxygen"
        bind:isSideNavOpen
        bind:expandedByDefault
>
    <div slot="skip-to-content">
        <SkipToContent/>
    </div>

    <HeaderNav>
        {#each menu as menuItem, index}
            {#if menuItem.children?.length >= 1}
                <HeaderNavMenu text={menuItem.title}>
                    {#each menuItem.children as childMenuItem, index}
                        <HeaderNavItem href={childMenuItem.url} text={childMenuItem.title}/>
                    {/each}
                </HeaderNavMenu>
            {:else}
                <HeaderNavItem href={menuItem.url} text={menuItem.title}/>
            {/if}
        {/each}
    </HeaderNav>

    <HeaderUtilities>
        <div style="color:darkorange;padding-top:12px;margin-right:6px;">
            <a
                    href="https://blockstream.info/"
                    style="text-decoration: none;color:coral;"
            ><h6>{BitcoinTipHeight().height}</h6></a
            >
        </div>
        <HeaderAction icon={Network_1}>
            <div style="width: 100%;padding:2px;margin-bottom:10%;">
                <h6>RELAYS [MUST]</h6>
                <hr/>
                <ul>
                    {#each defaultRelays as relay}
                        <li>{relay}</li>
                    {/each}
                </ul>
            </div>
            <div style="width: 100%;padding:2px;">
                <h6>RELAYS [OPTIONAL]</h6>
                <hr/>
                <ul>
                    {#each profileRelays as relay}
                        <li>{relay}</li>
                    {/each}
                </ul>
            </div>
        </HeaderAction>
        <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust}/>
        <HeaderAction icon={UserAvatarFilledAlt}>
            <HeaderPanelLinks>
                <HeaderPanelDivider>CURRENT USER DETAILS</HeaderPanelDivider>
                {#if !$currentUser}
                    <LoginNip07Button/>
                {/if}

                {#if $currentUser}
                    {#if $currentUser.profile?.name}
                        {$currentUser.profile?.name}
                    {:else}
                        Fetching profile....
                        {$currentUser.npub.substring(0, 12)}
                    {/if}
                {/if}
                <HeaderPanelDivider>CONSENSUS LEAD?</HeaderPanelDivider>
                {$weHaveTheLead}
            </HeaderPanelLinks>
        </HeaderAction>
    </HeaderUtilities>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
    <SideNavItems>
        {#each menu as menuItem, index}
            {#if menuItem.children?.length >= 1}
                <SideNavMenu text={menuItem.title}>
                    {#each menuItem.children as childMenuItem, index}
                        <SideNavMenuItem href={childMenuItem.url} text={childMenuItem.title}/>
                    {/each}
                </SideNavMenu>
            {:else}
                <SideNavLink href={menuItem.url} text={menuItem.title}/>
            {/if}
        {/each}
    </SideNavItems>
</SideNav>
