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
  } from "carbon-components-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import { UserAvatarFilledAlt } from "carbon-icons-svelte";
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
	<HeaderAction icon={UserAvatarFilledAlt} />
  </HeaderUtilities>
</Header>

<SideNav bind:isOpen={isSideNavOpen}>
  <SideNavItems>
    <SideNavLink text="Link 1" />
    <SideNavLink text="Link 2" />
    <SideNavLink text="Link 3" />
    <SideNavMenu text="Menu">
      <SideNavMenuItem href="/" text="Link 1" />
      <SideNavMenuItem href="/" text="Link 2" />
      <SideNavMenuItem href="/" text="Link 3" />
    </SideNavMenu>
    <SideNavDivider />
    <SideNavLink text="Link 4" />
  </SideNavItems>
</SideNav>