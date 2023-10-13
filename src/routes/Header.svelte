<script>
  import { base } from "$app/paths";
  import { weHaveTheLead } from "$lib/consensus/current-votepower";
  import { BitcoinTipHeight } from "$lib/helpers/bitcoin";
  import { currentUser } from "$lib/stores/current-user";
  import { defaultRelays, profileRelays } from "$lib/stores/ndk";
  import {
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
    SideNavDivider,
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    SkipToContent,
    breakpointObserver
  } from "carbon-components-svelte";
  import { Network_1, UserAvatarFilledAlt } from "carbon-icons-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import LoginNip07Button from "../components/LoginNIP07Button.svelte";
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
    <SkipToContent />
  </div>

  <HeaderNav>
    <HeaderNavItem href="{base}" text="Home" />
    <HeaderNavItem href="{base}/identity" text="People" />
    <HeaderNavItem href="{base}/rockets" text="Rockets" />
    <HeaderNavItem href="{base}/problems" text="Problem Tracker" />
    <HeaderNavMenu text="Tools">
      <HeaderNavItem href="/" text="Link 1" />
      <HeaderNavItem href="/" text="Link 2" />
      <HeaderNavItem href="/" text="Link 3" />
    </HeaderNavMenu>
    <HeaderNavItem href="{base}/mempool" text="Mempool" />
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
        <hr />
        <ul>
          {#each defaultRelays as relay}
            <li>{relay}</li>
          {/each}
        </ul>
      </div>
      <div style="width: 100%;padding:2px;">
        <h6>RELAYS [OPTIONAL]</h6>
        <hr />
        <ul>
          {#each profileRelays as relay}
            <li>{relay}</li>
          {/each}
        </ul>
      </div>
    </HeaderAction>
    <HeaderGlobalAction aria-label="Settings" icon={SettingsAdjust} />
    <HeaderAction icon={UserAvatarFilledAlt}>
      <HeaderPanelLinks>
        <HeaderPanelDivider>CURRENT USER DETAILS</HeaderPanelDivider>
        {#if !$currentUser}
          <LoginNip07Button />
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
    <SideNavLink href="{base}/" text="Home" />
    <SideNavLink href="{base}/identity" text="People" />
    <SideNavLink href="{base}/rockets" text="Rockets" />
    <SideNavLink href="{base}/problems" text="Problem Tracker" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
    <SideNavDivider />
    <SideNavLink href="{base}/mempool" text="Mempool" />
  </SideNavItems>
</SideNav>
