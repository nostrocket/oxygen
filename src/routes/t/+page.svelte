<script lang="ts">
  import makeEvent from "$lib/helpers/eventMaker";
  import { currentUser } from "$lib/stores/hot_resources/current-user";
  import {
    consensusTipState,
    mempool,
    rebroadcastEvents,
  } from "$lib/stores/nostrocket_state/master_state";
  import { NDKRelaySet, type NDKEvent } from "@nostr-dev-kit/ndk";
  import NDKSvelte from "@nostr-dev-kit/ndk-svelte";
  import { Mutex } from "async-mutex";
  import { Button, Row, Tile } from "carbon-components-svelte";
  import DeleteEvent from "../../components/modals/DeleteEvent.svelte";
  import { ndk, ndk_profiles } from "$lib/stores/event_sources/relays/ndk";

  let sendMutex = new Mutex();
  function onFormSubmit() {
    $mempool.forEach((ev) => {
      if (ev.kind == 15172008 && ev.pubkey == $currentUser?.pubkey) {
        let e = makeEvent({ kind: 5 });
        e.tags.push(["e", ev.id]);
        e.publish();
      }
    });
  }
  let published = new Set<string>()
  function republishAllMyEvents() {
    if ($currentUser) {
      let allMyEvents = $ndk_profiles.storeSubscribe<NDKEvent>(
        { authors: [$currentUser!.pubkey], kinds: [1], since: 1711400174 },
        { closeOnEose: true }
      );
      const publish: NDKSvelte = new NDKSvelte({
        explicitRelayUrls: ["wss://nostr.mutinywallet.com"],//["wss://nostr.mom","wss://nostr.einundzwanzig.space","wss://nos.lol","wss://relay.nostr.band","wss://relay.oldcity-bitcoiners.info","wss://nostr-relay.schnitzel.world","wss://relay.nostr.com.au","wss://knostr.neutrine.com","wss://nostr.nodeofsven.com","wss://nostr.vulpem.com","wss://relay.farscapian.com","wss://relay.sovereign-stack.org","wss://nostr-verif.slothy.win","wss://relay.lexingtonbitcoin.org","wss://relay-pub.deschooling.us","wss://nostr.easydns.ca","wss://relay.dwadziesciajeden.pl","wss://nostr.600.wtf","wss://e.nos.lol","wss://nostr-relay.texashedge.xyz","wss://ragnar-relay.com","wss://nostr.data.haus","wss://nostr.wine","wss://nostr.koning-degraaf.nl","wss://nostr.cheeserobot.org","wss://nostr.thank.eu","wss://relay.hamnet.io","wss://nostr.blockpower.capital","wss://nostr.sidnlabs.nl","wss://nostr.inosta.cc","wss://nostr21.com","wss://arc1.arcadelabs.co","wss://nostr.ch3n2k.com","wss://relay.nostrview.com","wss://relay.nostromo.social","wss://offchain.pub","wss://relay.nostr.wirednet.jp","wss://nostr.l00p.org","wss://lightningrelay.com","wss://bitcoinmaximalists.online","wss://private.red.gb.net","wss://relay.nostrid.com","wss://nostr.uthark.com","wss://nostr.cruncher.com","wss://relay.nostrcheck.me","wss://nostrelay.yeghro.site","wss://relay.nostr.vet","wss://nostrue.com","wss://nostr.danvergara.com","wss://nproxy.kristapsk.lv","wss://nostr.topeth.info","wss://nostr.bitcoiner.social","wss://relay.orange-crush.com","wss://nostr.spaceshell.xyz","wss://nostr.roundrockbitcoiners.com","wss://relay.f7z.io","wss://relay.nostrology.org","wss://nostr.bch.ninja","wss://relay.nostrati.com","wss://nostr-relay.nokotaro.com","wss://relay.snort.social","wss://nostr.lu.ke","wss://atlas.nostr.land","wss://nostr.fmt.wiz.biz","wss://global-relay.cesc.trade","wss://nostr.pjv.me","wss://relay.roli.social","wss://brb.io","wss://eden.nostr.land","wss://nostr-verified.wellorder.net","wss://nostr.noones.com","wss://relay.nostr.nu","wss://nostr-relay.bitcoin.ninja","wss://paid.no.str.cr","wss://deschooling.us","wss://freespeech.casa","wss://bitcoiner.social","wss://nostr.1f52b.xyz","wss://nostr.sebastix.dev","wss://relay-verified.deschooling.us","wss://nostr.cizmar.net","wss://n.wingu.se","wss://relay.nostr.hach.re","wss://nostr.asdf.mx","wss://nostr.bitcoinplebs.de","wss://tmp-relay.cesc.trade","wss://nostr.plebchain.org","wss://nostr.mutinywallet.com","wss://nostr.decentony.com","wss://nostr.tools.global.id","wss://nostrsatva.net","wss://xmr.usenostr.org","wss://nostr.naut.social","wss://at.nostrworks.com","wss://nostr.sovbit.host","wss://nostr.1sat.org","wss://nostr.randomdevelopment.biz","wss://mastodon.cloud/api/v1/streaming","wss://nostr.256k1.dev","wss://relay.beta.fogtype.com","wss://rsslay.ch3n2k.com","wss://nostr.rocketnode.space","wss://relay.nostr.bg","wss://nostr.malin.onl","wss://nostr.globals.fans","wss://nostr.primz.org","wss://relay.johnnyasantos.com","wss://btc.klendazu.com","wss://relay.n057r.club","wss://slick.mjex.me","wss://nostr.lorentz.is","wss://relay.primal.net","wss://nostr.cercatrova.me","wss://nostr.swiss-enigma.ch","wss://relay.honk.pw","wss://nostr-relay.derekross.me","wss://puravida.nostr.land","wss://nostr.sectiontwo.org","wss://nostr.oxtr.dev","wss://relay.s3x.social","wss://eosla.com","wss://nostr.liberty.fans","wss://nostr.cro.social","wss://nostr-01.bolt.observer","wss://nostrrelay.com","wss://nostr-pub.semisol.dev","wss://nostr.semisol.dev","wss://misskey.io","wss://nostr.pobblelabs.org","wss://relay.nostr.wf","wss://nostr.messagepush.io","wss://nostr.land","wss://relay.mostr.pub","wss://relay.shitforce.one","wss://relay.nostrplebs.com","wss://purplepag.es","wss://yestr.me","wss://relayable.org","wss://nostr-02.dorafactory.org","wss://nostr.zbd.gg","wss://relay.hodl.ar","wss://feeds.nostr.band/nostrhispano","wss://nostr.middling.mydns.jp","wss://ca.orangepill.dev","wss://nostr.portemonero.com","wss://search.nos.today","wss://relay.minds.com/nostr/v1/ws","wss://welcome.nostr.wine","wss://yabu.me","wss://relay.chicagoplebs.com","wss://adult.18plus.social","wss://nrelay.c-stellar.net","wss://nostrja-kari.heguro.com","wss://therelayofallrelays.nostr1.com","wss://nostr-relay.app","wss://rly.nostrkid.com","wss://nostr.filmweb.pl","wss://nostr.carlostkd.ch","wss://relay.utxo.one","wss://nostr.openhoofd.nl","wss://nostr.strits.dk","wss://nostr.zenon.info","wss://relay.nostr.moctane.com","wss://nostr.thesamecat.io","wss://relay.deezy.io","wss://nostr-usa.ka1gbeoa21bnm.us-west-2.cs.amazonlightsail.com","wss://relay.poster.place","wss://freerelay.xyz","wss://nostr.mining.sc","wss://nostr.xmr.rocks","wss://nostr.dvdt.dev","wss://paid.nostr.lc","wss://ithurtswhenip.ee","wss://nerostr.xmr.rocks","wss://nostr.sethforprivacy.com","wss://relay.rebelbase.site","wss://relay.vanderwarker.family","wss://wc1.current.ninja","wss://relay.toastr.space","wss://nostr.ingwie.me","wss://nostrpub.yeghro.site","wss://nostr.gleeze.com","wss://relay2.nostrchat.io","wss://relay1.nostrchat.io","wss://relay.greenart7c3.com","wss://ln.weedstr.net/nostrrelay/weedstr","wss://relay.devstr.org","wss://pleb.cloud","wss://nostr.dakukitsune.ca","wss://nostr.hifish.org","wss://nostr2.sanhauf.com","wss://nostrja-kari-nip50.heguro.com","wss://nostrua.com","wss://nostr.otc.sh","wss://ca.relayable.org","wss://relay.stpaulinternet.net","wss://relay.nsecbunker.com","wss://relay.house","wss://nostr.hekster.org","wss://relay.layer.systems","wss://relay.haths.cc","wss://nostr.schorsch.fans","wss://nostr.reelnetwork.eu","wss://relay.kisiel.net.pl","wss://relay.nostr.directory","wss://relay.wavlake.com","wss://r.v0l.io","wss://nostr-tbd.website","wss://sats.lnaddy.com/nostrclient/api/v1/relay","wss://nostr.438b.net","wss://nostr.fmar.link","wss://nostr.sagaciousd.com","wss://nostr.donky.social","wss://nostr.metamadeenah.com","wss://nostrja-world-relays-test.heguro.com","wss://multiplextr.coracle.social","wss://relay.mutinywallet.com","wss://dave.st.germa.in/nostr","wss://nostril.cam","wss://nostr.btc-library.com","wss://relay.getalby.com/v1","wss://rss.nos.social","wss://nostr.overmind.lol","wss://nostrools.nostr1.com","wss://beta.nostril.cam","wss://relay.nostrcn.com","wss://dev.nostrplayground.com","wss://ryan.nostr1.com","wss://nostr-01.yakihonne.com","wss://la.relayable.org","wss://relay.0xchat.com","wss://nostr.fort-btc.club","wss://relay.bitcoinpark.com","wss://satdow.relaying.io","wss://nostr.olwe.link","wss://nostr01.counterclockwise.io","wss://test.relay.report","wss://relap.orzv.workers.dev","wss://christpill.nostr1.com","wss://nostr.sixteensixtyone.com","wss://relay.danvergara.com","wss://relay.verified-nostr.com","wss://nostr.sathoarder.com","wss://nostr.sudocarlos.com","wss://wbc.nostr1.com","wss://nostr.eluc.ch","wss://relay.protest.net","wss://lnbits.eldamar.icu/nostrrelay/relay","wss://pater.nostr1.com","wss://nostr.heliodex.cf","wss://nostr.getgle.org","wss://nostr.lnbitcoin.cz","wss://nostr.libreleaf.com","wss://lnbits.michaelantonfischer.com/nostrrelay/michaelantonf","wss://relay.casualcrypto.date","wss://lightning.benchodroff.com/nostrclient/api/v1/relay","wss://butcher.nostr1.com","wss://jovial-fuchsia-euhyboma.scarab.im","wss://nostr.cx.ms","wss://fiatjaf.com","wss://tictac.nostr1.com","wss://bitstack.app","wss://nostr-relay.psfoundation.info","wss://purplerelay.com","wss://relay.hrf.org","wss://fiatdenier.nostr1.com","wss://relay.orangepill.ovh","wss://nostr.tchaicap.space","wss://nostr.rubberdoll.cc","wss://relay.nostrassets.com","wss://relay.ingwie.me","wss://nostr-relay.ktwo.io","wss://fistfistrelay.nostr1.com","wss://soloco.nl","wss://nostr.dlsouza.lol","wss://relay.kamp.site","wss://nostr.heavyrubberslave.com","wss://relay.keychat.io","wss://relay.froth.zone","wss://relay.ohbe.me","wss://nostr.lecturify.net","wss://nostr.hankhub.net","wss://nostr.bitcoinist.org","wss://nostr.stakey.net","wss://a.nos.lol","wss://teemie1-relay.duckdns.org","wss://hodlbod.nostr1.com","wss://eu.purplerelay.com","wss://nostr.lnproxy.org","wss://greensoul.space","wss://21ideas.nostr1.com","wss://hotrightnow.nostr1.com","wss://relay.bitcoinbarcelona.xyz","wss://rly.bopln.com","wss://nostr.fractalized.net","wss://verbiricha.nostr1.com","wss://relay-jp.shino3.net","wss://relay.stemstr.app","wss://zh.nostr1.com","wss://bevo.nostr1.com","wss://cache2.primal.net/v1","wss://relay.nquiz.io","wss://nostr.self-determined.de","wss://gardn.nostr1.com","wss://feedstr.nostr1.com","wss://nostr.kleofash.eu","wss://nostr.zoz-serv.org","wss://nostr.girino.org","wss://nostr.gerbils.online","wss://nostr.novacisko.cz","wss://nostr.0x7e.xyz","wss://sakhalin.nostr1.com","wss://adre.su","wss://remnant.cloud","wss://nostr.kungfu-g.rip","wss://relay.guggero.org","wss://cache1.primal.net/v1","wss://misskey.art","wss://merrcurrup.railway.app","wss://nostr-dev.zbd.gg","wss://relay.oke.minds.io/nostr/v1/ws","wss://tw.purplerelay.com","wss://atl.purplerelay.com","wss://misskey.systems","wss://novoa.nagoya","wss://submarin.online","wss://premis.one","wss://misskey.04.si","wss://social.camph.net","wss://in.purplerelay.com","wss://nostr.fairshare.social","wss://relay.pleb.to","wss://nostr.atitlan.io","wss://nostr.openordex.org","wss://nsrelay.assilvestrar.club","wss://nostr.lbdev.fun","wss://relay.corpum.com","wss://relay.benthecarman.com","wss://vitor.relaying.io","wss://relay.nostrhub.fr","wss://relay.noswhere.com","wss://relay.crimsonleaf363.com","wss://pablof7z.nostr1.com","wss://orangepiller.org","wss://relay.satoshidnc.com","wss://relay.siamstr.com","wss://relay.camelus.app","wss://frens.nostr1.com","wss://nostrasia.casa","wss://datagrave.wild-vibes.ts.net/nostr","wss://ae.purplerelay.com","wss://kr.purplerelay.com","wss://vitor.nostr1.com","wss://chefstr.nostr1.com","wss://n.ok0.org","wss://nostr.8777.ch","wss://umami.nostr1.com","wss://prism.nostr1.com","wss://sfr0.nostr1.com","wss://us.nostr.land","wss://relay.nostr.wien","wss://relay.nostr.jabber.ch","wss://testnet.plebnet.dev/nostrrelay/1","wss://th2.nostr.earnkrub.xyz","wss://relay.nostr.pt","wss://studio314.nostr1.com","wss://relay.piazza.today","wss://relay.mattybs.lol","wss://relay.exit.pub","wss://nostr.plantroon.com","wss://hk.purplerelay.com","wss://nostr.se7enz.com","wss://au.purplerelay.com","wss://br.purplerelay.com","wss://ca.purplerelay.com","wss://ch.purplerelay.com","wss://cl.purplerelay.com","wss://us.nostr.wine","wss://relay.proxymana.net","wss://cellar.nostr.wine","wss://fl.purplerelay.com","wss://nostr.stupleb.cc","wss://frjosh.nostr1.com","wss://inbox.nostr.wine","wss://relay.minibits.cash","wss://relay.livefreebtc.dev","wss://relay.hllo.live","wss://relay.sepiropht.me","wss://ftp.halifax.rwth-aachen.de/nostr","wss://shawn.nostr1.com","wss://relay.gems.xyz","wss://nostr.hubmaker.io","wss://loli.church","wss://lnbits.aruku.kro.kr/nostrrelay/private","wss://sushi.ski","wss://xmr.ithurtswhenip.ee","wss://relay.nos.social","wss://obiurgator.thewhall.com","wss://relay.staging.geyser.fund","wss://nostr.neilalexander.dev","wss://relay.causes.com","wss://nostr.psychoet.nexus","wss://nostr.1661.io","wss://relay.artx.market","wss://nostr.tavux.tech","wss://nostr-03.dorafactory.org","wss://nostr.atlbitlab.com","wss://lnbits.btconsulting.nl/nostrrelay/nostr","wss://nostr.zoel.network","wss://eostagram.com","wss://relay.geyser.fund","wss://lnbits.papersats.io/nostrclient/api/v1/relay","wss://creatr.nostr.wine","wss://yondar.nostr1.com","wss://riray.nostr1.com","wss://nostr.pklhome.net","wss://pyramid.fiatjaf.com","wss://node.coincreek.com/nostrclient/api/v1/relay","wss://relay.tunestr.io","wss://ren.nostr1.com","wss://santo.iguanatech.net","wss://cache0.primal.net/cache17","wss://nostr.33co.de","wss://nostr.t-rg.ws","wss://theforest.nostr1.com","wss://nostrdevs.nostr1.com","wss://njump.me","wss://nostr.cahlen.org","wss://khatru.puhcho.me","wss://strfry.chatbett.de","wss://milwaukie.nostr1.com","wss://relay.bitmapstr.io","wss://directory.yabu.me","wss://noxir.fly.dev","wss://srtrelay.c-stellar.net","wss://nostr.reckless.dev","wss://super-relay.cesc.trade","wss://bucket.coracle.social","wss://nostr.lopp.social","wss://relay.notoshi.win","wss://relay.zhoushen929.com","wss://sfgbsfg431512asf124as.xyz","wss://relay.hawties.xyz","wss://jp.purplerelay.com","wss://lnbits.satoshibox.io/nostrclient/api/v1/relay","wss://rkgk.moe","wss://relay.dev.bdw.to","wss://jumpy-bamboo-euhyboma.scarab.im","wss://ksdfgsg12412312sdgfq23.online","wss://gjmhmhgi789hjgdyerysergdfvbncte.fyi","wss://carlos-cdb.top","wss://relay.moinsen.com","wss://hayloo88.nostr1.com","wss://a214g24132sa2fas354411f234125.xyz","wss://itchy-goldenrod-furconthophagus.scarab.im","wss://140.f7z.io","wss://noxir.kpherox.dev","wss://taipei.scarab.im","wss://hongkong.scarab.im","wss://beijing.scarab.im","wss://nostr.madco.me","wss://jingle.carlos-cdb.top","wss://staging.yabu.me","wss://nostrrelay.win","wss://adfasfasfadsdfasfasf3123412ewfas.xyz","wss://nostr.sats.li","wss://nostr.notribe.net","wss://paid.relay.vanderwarker.family","wss://stlouis.scarab.im","wss://nostr.animeomake.com","wss://23asdfasf2r341gnbrrhjhwggadffgasfsadfasafa.xyz","wss://287avuahggadsd213rg18aga3yg3whg8g8afg.xyz","wss://relay.credenso.cafe","wss://rnostr.onrender.com","wss://relay.blogstr.app","wss://u42qujakzujtggyjtdcjl6b582z1gvckh52.xyz","wss://kadargo.zw.is","wss://relay2.blogstr.app","wss://relay.famstr.xyz","wss://relay.roygbiv.guide","wss://nostr.ussenterprise.xyz","wss://relay.swisslightning.net","wss://relay3.blogstr.app","wss://nostr.searx.is","wss://xxmmrr.shogatsu.ovh","wss://nostr.extrabits.io","wss://relay.magiccity.live","wss://dev-relay.nostrassets.com","wss://nostr.happytavern.co","wss://relay.agorist.space","wss://nostr.intrepid18.com","wss://nostr.ser1.net","wss://frogathon.nostr1.com","wss://marmot.nostr1.com","wss://island.nostr1.com","wss://nostr.jfischer.org","wss://relay.earthly.land","wss://relay.strfront.com","wss://test2.relay.report","wss://bostr.nokotaro.work","wss://relay.angor.io","wss://r314y.0xd43m0n.xyz","wss://relay.nostrosity.com","wss://bostr.nokotaro.com","wss://relay.lawallet.ar","wss://beta.1661.io","wss://nostr.cyberveins.eu","wss://nostr.okaits7534.net","wss://relay.nimo.cash","wss://relay.cosmicbolt.net","wss://relay.nostrr.de","wss://nostr.dmgd.monster","wss://relay.bitheaven.social","wss://nostr-relay.jezza.online","wss://bouncer.nostree.me","wss://relay.lax1dude.net","wss://relay.13room.space","wss://relay.westernbtc.com","wss://nostr.char0n.ch","wss://relay.timechaindex.com","wss://misskey.cloud","wss://relay.blackbyte.nl","wss://relay.lumina.rocks","wss://relay2.denostr.com","wss://fiatjaf.nostr1.com","wss://nostr.bureau-wehrmann.eu","wss://nostr.at","wss://nostr.babyshark.win","wss://nostr.coincrowd.fund","wss://relay.nostar.org","wss://nostr.nobkslave.site","wss://nostr.jaonoctus.dev","wss://relay.digitalezukunft.cyou","wss://relay.s-w.art","wss://bbb.santos.lol","wss://nostr.petrkr.net/strfry","wss://bits.lnbc.sk/nostrclient/api/v1/relay","wss://thenewregi.me/nostr","wss://echo.websocket.org","wss://dmux.net/apps/strfry","wss://relay.nip05.social","wss://dash.mockingyou.com","wss://relay.gasteazi.net","wss://fog.dedyn.io","wss://mm.suzuqi.com","wss://relay.highlighter.com","wss://relay.urbanzap.space","wss://relay.nostrasia.net","wss://nostrainsley.nostr1.com","wss://strfry.iris.to","wss://dreamofthe90s.nostr1.com","wss://relay.dolu.dev","wss://relay2.nostrasia.net","wss://dev-relay.kube.b-n.space","wss://bostr.bitcointxoko.com","wss://kmc-nostr.amiunderwater.com","wss://relay.usefusion.ai","wss://nostr01.sharkshake.net","wss://nostr02.sharkshake.net","wss://nostr.coinfund.app","wss://nostr.tbai.me:592","wss://nostr.lifeonbtc.xyz","wss://relay.hangar.ninja","wss://relay.nostpy.lol","wss://hist.nostr.land","wss://primal-cache.mutinywallet.com/v1","wss://freelay.sovbit.host","wss://relay.nsec.app","wss://cl4.tnix.dev","wss://relay.sebdev.io","wss://nostr.yuhr.org","wss://chorus.mikedilger.com:444","wss://nostr.myshosholoza.co.za","wss://nostr.btczh.tw","wss://nostr.sebastix.social","wss://nostr-relay.rawrapp.workers.dev","wss://galaxy13.nostr1.com","wss://chorus.pjv.me","wss://nostr.comunidadecancaonova.com","wss://nostr.palandi.cloud","wss://nostr.codingarena.top","wss://nostr.pistaum.com","wss://relay.wikifreedia.xyz","wss://relay.nostrocket.org","wss://strfry.openhoofd.nl","wss://nostr.gocharlie.ai","wss://nymble.tylerfreedman.com","wss://nostria.space","wss://nostr.a2x.pub","wss://nostr.itsnebula.net","wss://notes.miguelalmodo.com","wss://support.nostr1.com","wss://relay.phantom-power.coracle.tools","wss://relay.varke.eu","wss://relay.cxplay.org","wss://freedomhub1.reelnetwork.eu","wss://blowater.nostr1.com","wss://relay.refinery.coracle.tools","wss://jingle.nostrver.se","wss://nostr.drafted.pro","wss://proxy-experiment.onrender.com","wss://nostr.lnwallet.app","wss://relays.diggoo.com","wss://nostr.nebuu.la","wss://nostr.hashbang.nl","wss://relay.zone667.com","wss://hoped-license-jeffrey-san.trycloudflare.com","wss://bostr.freespeech.casa","wss://custom.fiatjaf.com","wss://nostr-relay.algotech.io","wss://bostr.online"], //"ws://127.0.0.1:6969", "wss://nostr.688.org"
      });
      
      (async () => {
        try {
          await publish.connect();
          console.log("publish connected");
          allMyEvents.subscribe((x) => {
            x.forEach((e) => {
              if (!published.has(e.id)) {
                published.add(e.id)
                sendMutex.acquire().then(()=>{
                e.ndk = publish;
              e.publish().then(x=>{console.log(x)}).finally(()=>{
                sendMutex.release()
              });
              })
              }
            });
          });
        } catch (e) {
          console.error(e);
        }
      })();
    }
  }
</script>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        console.log($consensusTipState);
      }}>Print consensusTipState to console</Button
    >
  </Tile>
</Row>
<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        console.log($consensusTipState.Copy());
      }}>Print clone of consensusTipState to console</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <DeleteEvent type="consensus" />
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        onFormSubmit();
      }}>Delete all consensus events</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        rebroadcastEvents(sendMutex);
      }}>Republish events in current state to all relays</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        republishAllMyEvents();
      }}>Republish my events</Button
    >
  </Tile>
</Row>

<Row>
  <Tile style="margin-bottom:1%;">
    <Button
      on:click={() => {
        let e = makeEvent({kind:6969})
        e.publish(NDKRelaySet.fromRelayUrls(["ws://127.0.0.1:6969"], $ndk)).then(r=>{
          console.log(r)
        })
      }}>Test 688.org</Button
    >
  </Tile>
</Row>