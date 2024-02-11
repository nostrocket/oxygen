<script lang="ts">
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { weHaveTheLead } from "$lib/consensus/votepower";
  import { bitcoinTip, getBitcoinTip } from "$lib/helpers/bitcoin";
  import { unixTimeNow } from "$lib/helpers/mundane";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
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
    SideNavItems,
    SideNavLink,
    SideNavMenu,
    SideNavMenuItem,
    SkipToContent,
    Tag,
  } from "carbon-components-svelte";
  import { Network_1, UserAvatarFilledAlt } from "carbon-icons-svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";
  import CommentUser from "../components/comments/CommentUser.svelte";
  import LoginNip07Button from "../components/elements/LoginNIP07Button.svelte";
  import { defaultRelays, profileRelays, testnet } from "../settings";
  import menu from "./menu";

  let isSideNavOpen = false;
  let expandedByDefault = false;

  let lastRequestTime = 0;

  $: {
    if (unixTimeNow() > lastRequestTime + 30000) {
      getBitcoinTip().then((x) => {
        if (x) {
          lastRequestTime = unixTimeNow();
        }
      });
    }
  }
</script>

<Header bind:isSideNavOpen bind:expandedByDefault>
  <div slot="skip-to-content">
    <SkipToContent />
    <div
      style="cursor:pointer;float:left;margin-left:6px;margin-top:4px;text-align:center;"
      on:click={() => {
        goto(`${base}/About`);
      }}
    >
      <h4 style="margin: 0;">NOSTROCKET!</h4>
      <p style="font-size: xx-small;font-style:italic;">
        Separation of Business and State
      </p>
    </div>
  </div>

  <HeaderNav>
    {#each menu as menuItem, index}
      {#if menuItem.children?.length >= 1}
        <HeaderNavMenu text={menuItem.title}>
          {#each menuItem.children as childMenuItem, index}
            <HeaderNavItem
              href={childMenuItem.url}
              text={childMenuItem.title}
            />
          {/each}
        </HeaderNavMenu>
      {:else}
        <HeaderNavItem href={menuItem.url} text={menuItem.title} />
      {/if}
    {/each}
  </HeaderNav>

  <HeaderUtilities>
    {#if testnet}<Tag type="red">TESTNET</Tag>{:else}<Tag type="green"
        >MAINNET</Tag
      >{/if}
    <div style="color:darkorange;padding-top:12px;margin-right:6px;">
      <a
        href="https://blockstream.info/"
        style="text-decoration: none;color:coral;"
        ><h6>{$bitcoinTip.height}</h6></a
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
      <div style="width: 100%;padding:2px;">
        <h6>TOOLS</h6>
        <hr />
        <p on:click={()=>{goto(`${base}/t`)}}>/t</p>
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
          <CommentUser pubkey={$currentUser.pubkey} />
        {/if}
        <HeaderPanelDivider>CONSENSUS LEAD?</HeaderPanelDivider>
        {$weHaveTheLead}
        <HeaderPanelDivider>OXYGEN VERSION</HeaderPanelDivider>
        "Fate Amenable to Change"
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
            <SideNavMenuItem
            on:click={()=>{if (childMenuItem.url){isSideNavOpen = false}}}
              href={childMenuItem.url}
              text={childMenuItem.title}
            />
          {/each}
        </SideNavMenu>
      {:else}
        <SideNavLink on:click={()=>{if (menuItem.url){isSideNavOpen = false}}} href={menuItem.url} text={menuItem.title} />
      {/if}
    {/each}
  </SideNavItems>
</SideNav>
