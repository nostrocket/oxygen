<script>
  import { page } from "$app/stores";
  import { base } from "$app/paths";
  import { Airplane, CodeSyntax, Rocket } from "carbon-pictograms-svelte";
  import {
    Header,
    HeaderNav,
    HeaderNavItem,
    HeaderNavMenu,
    SideNav,
    SideNavItems,
    SideNavMenu,
    SideNavMenuItem,
    SideNavLink,
    SideNavDivider,
    SkipToContent,
    Content,
    Grid,
    Row,
    Column,
    breakpointObserver,
    breakpoints,
    HeaderUtilities,
    HeaderGlobalAction,
    HeaderAction,
    HeaderPanelLink,
    HeaderPanelLinks,
    HeaderPanelDivider,
  } from "carbon-components-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import { UserAvatarFilledAlt } from "carbon-icons-svelte";
  import { currentUser } from "$lib/stores/current-user";
  import LoginNip07Button from "../components/LoginNIP07Button.svelte";
  import { weHaveTheLead } from "$lib/stores/current-votepower";
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
    <HeaderNavItem href="{base}/" text="People" />
    <HeaderNavItem href="{base}/rockets" text="Rockets" />
    <HeaderNavItem href="/" text="Link 3" />
    <HeaderNavMenu text="Menu">
      <HeaderNavItem href="/" text="Link 1" />
      <HeaderNavItem href="/" text="Link 2" />
      <HeaderNavItem href="/" text="Link 3" />
    </HeaderNavMenu>
    <HeaderNavItem href="/" text="blah"/>
  </HeaderNav>

  <HeaderUtilities>
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
    <SideNavLink href="{base}/" text="People" />
    <SideNavLink href="{base}/rockets" text="Rockets" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
    <SideNavDivider />
    <SideNavLink href="/" text="blah" />
  </SideNavItems>
</SideNav>