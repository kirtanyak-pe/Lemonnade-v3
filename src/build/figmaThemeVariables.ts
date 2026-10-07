// The "🎨 L3 → Theme" variables of the ✅ Lemonnade V3 Figma library (lxQ6QIXGOv5mmx0khh5sJn), by variable key.
// A Figma design that colors a layer with one of these is drawn with the matching CSS variable, so it follows the
// canvas theme (Lemonn, Kuber, CS PRO; light or dark). Read from the library with the Figma Plugin API; regenerate it
// when theme variables are added or renamed in Figma.

/** Key of the theme variable collection, as it appears in a design's explicit variable modes. */
export const themeCollectionKey = '74a00b0383b9dcf4ccf633e940e443afce63f150'

/** Theme mode id → light or dark. A frame set to a mode keeps that light/dark; the product follows the canvas. */
export const themeModes: Record<string, 'light' | 'dark'> = {
  '200:0': 'light',
  '200:2': 'dark',
  '4090:0': 'dark',
  '4117:1': 'light',
  '4117:0': 'dark',
  '4420:0': 'light',
  '4432:1': 'dark',
  '4432:2': 'dark',
  '4432:3': 'light',
  '4432:4': 'dark',
}

/** Variable key → CSS custom property. */
export const themeVariables: Record<string, string> = {
  'aaca14dd47e1f6547e5535f2fb4f40abcd501f96': '--l3-surface-default', // surface/default
  '781e2c63719a82534b26d4bb5417ab03de9f8890': '--l3-surface-primary', // surface/primary
  '89589f4dea45302327fae3b9704df8f25a046413': '--l3-surface-secondary', // surface/secondary
  'b3c33ec76b3251292e491aa91a49f9eb884d026d': '--l3-surface-tertiary', // surface/tertiary
  '2090a730f3313af0780aeae427182623f474aabc': '--l3-border-light', // border/light
  'eb41cd39c5b554e600571d60dca46f1081341265': '--l3-border-dark', // border/dark
  'ede28d0b24d3818159ec3580972b8cf549af3528': '--l3-content-primary', // content/primary
  'c5f3f1da58eb2c45a931e9d850f2b05b91be418d': '--l3-content-secondary', // content/secondary
  '0db4ebd7677cbb6c78ed2d00df8c6084473d9cb5': '--l3-content-inverted', // content/inverted
  '26a564b63eeb31e8ca782ddedba54aac407d52b4': '--l3-surface-accent-brand-light', // surface/accent/brand-light
  'c42335428ad229a78e279c7a636ebe7c624f2ca4': '--l3-surface-accent-brand-default', // surface/accent/brand-default
  '6408cbb2986e5ea8c8b1035f53f9a47a33390000': '--l3-surface-accent-indicator-up-light', // surface/accent/indicator/up-light
  'd3ca991d199c39fe9c8f96dfe61dafc04a2bab69': '--l3-surface-accent-indicator-up-default', // surface/accent/indicator/up-default
  '48e7f437c9e4b2ac0a4c120ee28b15379efe0c93': '--l3-surface-accent-indicator-down-light', // surface/accent/indicator/down-light
  'a2647463d836c19176b8ee432de5b4a27f9cbc42': '--l3-surface-accent-indicator-down-default', // surface/accent/indicator/down-default
  '97ea94fe5ae1997deaa55338e85ec235d69eca16': '--l3-surface-accent-error-light', // surface/accent/error-light
  '6cb5793e1dd8c18d1a77e192cd1a2ecf5f0701ff': '--l3-surface-accent-error-default', // surface/accent/error-default
  '1492dd4a20fd19bd48b672b38d7dce5b18c1b62a': '--l3-surface-accent-success-light', // surface/accent/success-light
  'bb61664f9983760f6aef898927b66991bfc5f568': '--l3-surface-accent-success-default', // surface/accent/success-default
  'e770c37f92196af7a0ef0e68d20135033aec7a43': '--l3-surface-accent-warning-light', // surface/accent/warning-light
  '073a9c6ba86db5632b24cfd219256af5dcf815c5': '--l3-surface-accent-warning-default', // surface/accent/warning-default
  '0f5233427e1c0b3703ecb68f91936efb39e0f89f': '--l3-content-accent-indicator-up-default', // content/accent/indicator/up-default
  'e9b5023345b3e1b61e5c728a93cf23ade2b2313b': '--l3-content-accent-indicator-down-default', // content/accent/indicator/down-default
  '57c8c4d661709534836d678197e96f493a704662': '--l3-content-accent-brand-default', // content/accent/brand-default
  '00a05daf15802191c67411e83a507df6e3ed5fc6': '--l3-content-accent-error-default', // content/accent/error-default
  '34457ae67b0c6bf6615e55446b1252b1425d97ec': '--l3-content-accent-success-default', // content/accent/success-default
  '35547cf1dfd9c32a842128ad1652b729b682fc55': '--l3-content-accent-warning-default', // content/accent/warning-default
  'c8efd5b2b3209e3065920f3ff1658adff4fa235e': '--l3-content-tertiary', // content/tertiary
  '3b320b81f391a8cd532748b72f10956393c3e286': '--l3-surface-inverted', // surface/inverted
  '2ed960bb220964e0533888b9864308d7602c1563': '--l3-surface-accent-purple-light', // surface/accent/purple-light
  'cbc0a4ade04fc25cea8ab786fff0b7348d2353ca': '--l3-surface-accent-purple-default', // surface/accent/purple-default
  '2d581c2c4ec9552270fd148fe4a9b3272084c977': '--l3-surface-accent-indigo-light', // surface/accent/indigo-light
  '048f0f15f0e58a59501569d7330e85f56433cacc': '--l3-surface-accent-indigo-default', // surface/accent/indigo-default
  '1469675725a6b63ce351f8410c2bd8531be06942': '--l3-surface-accent-teal-light', // surface/accent/teal-light
  'ee648fcfb949f657a7746d75ac37b80a6cbb0579': '--l3-surface-accent-teal-default', // surface/accent/teal-default
  '8c6deffc2f012be38d80aea113f52a107797fac2': '--l3-surface-accent-discover-light', // surface/accent/discover-light
  'bdc3cb9b30c5f47082da2327f7e41ea90a8c7fc3': '--l3-surface-accent-discover-default', // surface/accent/discover-default
  'fb895ff8a4f6480f4d5d23e0401d58a0641796bc': '--l3-content-accent-purple-default', // content/accent/purple-default
  '69cb11551820f40936cb5153dda30024b1d63e7c': '--l3-content-accent-indigo-default', // content/accent/indigo-default
  'c01d61e2aa0c612f5fbe88b9be590f7c7f63eaf4': '--l3-content-accent-teal-default', // content/accent/teal-default
  '08678f8b00d1508fbded35e7434d13afcf80074c': '--l3-content-accent-discover-default', // content/accent/discover-default
  '931c4bd8c49ce0a37bec027bbd9370facda58a4d': '--l3-surface-accent-orange-light', // surface/accent/orange-light
  'ff41cc81bc874c3de295aceea935c5f271cb9fac': '--l3-surface-accent-orange-default', // surface/accent/orange-default
  '25fefefa2bfdced3eabf2eb5580458bc0e00972b': '--l3-content-accent-orange-default', // content/accent/orange-default
  'e5fa2f06aa29bed0b400081e24ca74f4aab02b8f': '--l3-border-accent-brand-light', // border/accent/brand-light
  'a07656dc595fe03834c047c0683600dd907a5cdb': '--l3-border-accent-brand-default', // border/accent/brand-default
  '1e6f4e2b3d42e0c5808f25b41a7afc08760c9e77': '--l3-border-accent-indicator-up-light', // border/accent/indicator/up-light
  '40c957913cd5eb64656196675ee2330e9b6c0d9d': '--l3-border-accent-indicator-up-default', // border/accent/indicator/up-default
  '9308bce9dd7717d5c95b3729025ccbf01095d11e': '--l3-border-accent-indicator-down-light', // border/accent/indicator/down-light
  '8d0f0b6d8bfaab9ab6b27f39375b64676e700a25': '--l3-border-accent-indicator-down-default', // border/accent/indicator/down-default
  'f6fc901d7472eecca2dd9c6b1fb571fefc7f37d5': '--l3-border-accent-error-light', // border/accent/error-light
  '9541ddcc74fcd7f0e1b1b3a61a86360023514bf5': '--l3-border-accent-error-default', // border/accent/error-default
  '98285c720bdf071a556e025718c63470e3cfbdf6': '--l3-border-accent-success-light', // border/accent/success-light
  'ccd973c7378b435bc0d9b9bb6a7bd4fa76da3920': '--l3-border-accent-success-default', // border/accent/success-default
  '0e266a8268e35c6c88442466a5b5187fca0fc0bf': '--l3-border-accent-warning-light', // border/accent/warning-light
  'eb5b724d86b944b647b3f5d855e2286057c2ce7c': '--l3-border-accent-warning-default', // border/accent/warning-default
  'b8341e443b365990afa7166aa4517bb494d1e699': '--l3-border-accent-purple-light', // border/accent/purple-light
  '91ae5232b974dda1fcdef147dd7bac042a0eb0c6': '--l3-border-accent-purple-default', // border/accent/purple-default
  'c97999b212c4904137f68dd49256579e1cb0da55': '--l3-border-accent-indigo-light', // border/accent/indigo-light
  '76727508492973088c013b5624abd9cf72dcb564': '--l3-border-accent-indigo-default', // border/accent/indigo-default
  'eefb61269c2f66811280fc7f7c4f1a87cc63b870': '--l3-border-accent-teal-light', // border/accent/teal-light
  '4ba4b1965edbb538df64983d6f26947a72f97ba4': '--l3-border-accent-teal-default', // border/accent/teal-default
  '8bd5554bb693d891a7aec4b3340daf15a216d8b1': '--l3-border-accent-discover-light', // border/accent/discover-light
  '360e7af2f7f87c2f47c9362e29f3cdf30c252938': '--l3-border-accent-discover-default', // border/accent/discover-default
  '33a30ed2b4a3efb0a74a6784fea05975758ab6db': '--l3-border-accent-orange-light', // border/accent/orange-light
  '91cdc1594d9e976142e3eca53ff8e50e9fb446e0': '--l3-border-accent-orange-default', // border/accent/orange-default
  '0407f463664d4edf2c11e46b8d9f1fe0b5651b1a': '--l3-surface-disabled', // surface/disabled
  '39043cc06b7db7abeae789eac38c4e89af0673d6': '--l3-content-disabled', // content/disabled
  '759b08a48aac3683c52431d78be8bf7fce05e364': '--l3-border-disabled', // border/disabled
  '1a864b68cd884ca2adf96883dc76379e49bc358f': '--l3-border-intense', // border/intense
  'cd2786f00c7468604f47dd4a9e7de49ea90a09ee': '--l3-surface-quaternary', // surface/quaternary
  'aace168aac741727b0d22267ed6a3f8e7e38da65': '--l3-surface-accent-zing-light', // surface/accent/zing-light
  '2acd829e312671305900d33211f7a6b3d3be59d6': '--l3-surface-accent-zing-default', // surface/accent/zing-default
  '958966378c55de41bd860c4a0d928a88bf0fc950': '--l3-static-white', // static/white
  'a83fd692f9431d3e2a26b72625448038fcf47cb8': '--l3-static-black', // static/black
  'd9611ee5dd521fd19fae6ad1cb43286782603405': '--l3-extra-gold-50', // extra/gold/50
  '598d60416e8af387f6e7e45664bc734489739533': '--l3-content-accent-zing-default', // content/accent/zing-default
  'af27441c945022fe72e25745dee1fa0c177dad30': '--l3-border-accent-zing-default', // border/accent/zing-default
  '1d4ad8f34fe4f7eddd6d7ac4b6313cefbf62522c': '--l3-border-accent-zing-light', // border/accent/zing-light
  '7798b8e0150113faf87e7fc90abf111e134d41ab': '--l3-extra-gold-100', // extra/gold/100
  '6bf1342e7401dafc77aa2a625173ce9f2cb2710b': '--l3-extra-gold-200', // extra/gold/200
  'a16e961fbdb9cb54d3943dbef8b515030e0a952f': '--l3-extra-gold-300', // extra/gold/300
  'cd4605558f2e950bb71fb7b5e6738bee4c7b8219': '--l3-extra-gold-400', // extra/gold/400
  '435ed870166361315f5672a194a4575fc59a4dd7': '--l3-extra-gold-500', // extra/gold/500
  '7cef41e5c5b14dce50269ba62a47025ca2894eb8': '--l3-extra-gold-600', // extra/gold/600
  '8bcf37e6da54a6959cc8f94e41d8de5aab6e54b3': '--l3-extra-gold-700', // extra/gold/700
  '23a6673e03c297f8335fe11c0b7a54060bd91bd4': '--l3-extra-gold-800', // extra/gold/800
  '455675f609ac86f1a7a954904a23807aaedb2be2': '--l3-extra-gold-900', // extra/gold/900
  '5606b39c3efef660f1d6a8cff42cf078699ce091': '--l3-gradient-stop-0-accent-brand-default', // gradient-stop-0/accent/brand-default
  '3893fece60430297b08bef8e2bf2c8c3ba10f6de': '--l3-gradient-stop-0-accent-error-light', // gradient-stop-0/accent/error-light
  'c45ec0d10b1c526e4bc21d00f7a95ea44bac6ba6': '--l3-gradient-stop-0-accent-error-default', // gradient-stop-0/accent/error-default
  '9024d76cffc4ee6da99dd4cd09818738eee30664': '--l3-gradient-stop-0-accent-indicator-up-light', // gradient-stop-0/accent/indicator/up-light
  '1c380a7778c8ae0e0e9fef4d349345822660cd35': '--l3-gradient-stop-0-accent-indicator-up-default', // gradient-stop-0/accent/indicator/up-default
  'f5e1b291aa65a047a2e24c60f9202ba24480ab3a': '--l3-gradient-stop-0-accent-indicator-down-light', // gradient-stop-0/accent/indicator/down-light
  '7af1aab06c3c205817814e76aaaec48707174e1c': '--l3-gradient-stop-0-accent-indicator-down-default', // gradient-stop-0/accent/indicator/down-default
  '842e5974ac9ea95c9d294c7addf1b8f11985fca4': '--l3-gradient-stop-0-accent-success-light', // gradient-stop-0/accent/success-light
  '9a96742fe311c7929502fc4534998e52e95329a3': '--l3-gradient-stop-0-accent-success-default', // gradient-stop-0/accent/success-default
  'c4f157427c37b5c1b4c6a14801c5cf269e300f01': '--l3-gradient-stop-0-accent-warning-light', // gradient-stop-0/accent/warning-light
  '7d0b5ebba807cdf3e6d4d0b38e9b3a6c22d69af6': '--l3-gradient-stop-0-accent-warning-default', // gradient-stop-0/accent/warning-default
  'a2c98bc2238be504420b83b2ce66c72ad904e22b': '--l3-gradient-stop-0-accent-purple-light', // gradient-stop-0/accent/purple-light
  '693d0f4fd337453b6b6127b002a286a8a71ac86a': '--l3-gradient-stop-0-accent-purple-default', // gradient-stop-0/accent/purple-default
  '5bac004a4beeb8e08e6e5051f56e612251cbaf25': '--l3-gradient-stop-0-accent-indigo-light', // gradient-stop-0/accent/indigo-light
  'cf52428351a5de56792de2dd0cb192a3e3541e5e': '--l3-gradient-stop-0-accent-indigo-default', // gradient-stop-0/accent/indigo-default
  'ce580c0778f8e6b46568e1e6409c7e63c34b832e': '--l3-gradient-stop-0-accent-teal-light', // gradient-stop-0/accent/teal-light
  '5c73576aacf2968d9e5bc5e0e6dc1516b9a84b53': '--l3-gradient-stop-0-accent-teal-default', // gradient-stop-0/accent/teal-default
  '8d24e4a57c44f19c4460806718b4a4d2b6c6f3a8': '--l3-gradient-stop-0-accent-discover-light', // gradient-stop-0/accent/discover-light
  '707003e3100d21af0829087f420af94475269004': '--l3-gradient-stop-0-accent-discover-default', // gradient-stop-0/accent/discover-default
  '55d8b1fcdf9aeb28dd554992a2ec5e48c291c27f': '--l3-gradient-stop-0-accent-orange-light', // gradient-stop-0/accent/orange-light
  'deb91f26737a75c1afce1beda7ef5277bc5a61a4': '--l3-gradient-stop-0-accent-orange-default', // gradient-stop-0/accent/orange-default
  'bd3e15f0fa3202694965d00f01f3bc2f7dda8b47': '--l3-gradient-stop-0-accent-zing-light', // gradient-stop-0/accent/zing-light
  'e9b68cf5c4086642eb15e2e432afd6efef16ef22': '--l3-gradient-stop-0-accent-zing-default', // gradient-stop-0/accent/zing-default
  'ce35bdcfdc09d2959d0db5f6ad732399fc1f0a09': '--l3-gradient-stop-0-surface-primary', // gradient-stop-0/surface/primary
  'a38365909089b282cede2a97477f7946a8ced7c0': '--l3-gradient-stop-0-surface-secondary', // gradient-stop-0/surface/secondary
  'ae3d7311c6864422d9bf49e74ebfc61154cf8159': '--l3-gradient-stop-0-surface-tertiary', // gradient-stop-0/surface/tertiary
  '029cdb5e40137881390ddba192e6424799da281a': '--l3-gradient-stop-0-surface-inverted', // gradient-stop-0/surface/inverted
  'b5ef49e0a5d627304f1ac8b4a1378c70b05f7edc': '--l3-gradient-stop-0-surface-quaternary', // gradient-stop-0/surface/quaternary
  '87a46e0a725c7de3ca3d89863cac7f4eef75be9c': '--l3-gradient-stop-0-surface-default', // gradient-stop-0/surface/default
  '951772b293e8aae29e32cf695561068e521a9a7d': '--l3-gradient-stop-0-content-primary', // gradient-stop-0/content/primary
  '00caffa41e841cce88bd3a9f81ae49c6f40b3d0e': '--l3-gradient-stop-0-content-secondary', // gradient-stop-0/content/secondary
  '80c74d6620c9f9263c7ffe2ab72abaf6e611d395': '--l3-gradient-stop-0-content-inverted', // gradient-stop-0/content/inverted
  'c5243a9b3298b2d8ff9c1f6c20f43330401a7729': '--l3-gradient-stop-0-content-tertiary', // gradient-stop-0/content/tertiary
  '9c18e17880a9208dfe78eab54313ff0f679fd871': '--l3-gradient-stop-0-content-disabled', // gradient-stop-0/content/disabled
  '41f9f4b52aeb963a3661e071fbababbe3489a15d': '--l3-gradient-stop-0-border-light', // gradient-stop-0/border/light
  '4b06eb5d636c52fe7bb7a631e06479c2886024a6': '--l3-gradient-stop-0-border-dark', // gradient-stop-0/border/dark
  'faa9b5c2eaeddb74f92b7a2aae127688ba0e733d': '--l3-gradient-stop-0-border-inverted', // gradient-stop-0/border/inverted
  '816076f7c24a15f6376f710824e926857082db16': '--l3-gradient-stop-0-border-intense', // gradient-stop-0/border/intense
  'e1b4bc3fc181f1f1b4fce4507d6c7d706e53ef10': '--l3-surface-accent-us-stock-light', // surface/accent/us-stock-light
  'cedd42c7715cf3cceb95b09a71d32e331ce19191': '--l3-surface-accent-us-stock-default', // surface/accent/us-stock-default
  '50caf114f44d0de206b4ce13c04a846efe61a650': '--l3-border-accent-us-stock-default', // border/accent/us-stock-default
  'a646b70547e818a75c5c5b495e7d55a56267cbe7': '--l3-border-accent-us-stock-light', // border/accent/us-stock-light
  '70588309f492df5a70f9ad118f178b605470f045': '--l3-gradient-stop-0-accent-us-stock-default', // gradient-stop-0/accent/us-stock-default
  'a84afa0235863019344050e3c83400990c82e35e': '--l3-gradient-stop-0-accent-us-stock-light', // gradient-stop-0/accent/us-stock-light
  '09f31d8f1f2bc6cf198cdadc92a48445af85de62': '--l3-content-accent-us-stock-default', // content/accent/us-stock-default
  '961d5ece42d4c256ab0550d6caef6acbe4ce14bb': '--l3-gradient-stop-0-accent-brand-light', // gradient-stop-0/accent/brand-light
  'b2e1bab31133d8dd38e5c79cdf958abe3a2dae59': '--l3-button-brand-surface', // component/button/brand/surface
  'da12c2add66b426ea2847a16d3ecc7dcbb09c83f': '--l3-button-brand-content', // component/button/brand/content
  '7e559bfedfbe3ecda4d4e4e9ccbc8b8d54fc899b': '--l3-button-primary-surface', // component/button/primary/surface
  '8850101f4a0f8d64517b3c7b85dd70bb7073f790': '--l3-button-primary-content', // component/button/primary/content
  'e2b372394b4b1715eccc67a342a809de42188ebc': '--l3-button-secondary-surface', // component/button/secondary/surface
  '7f17cc293af15aff261bbbdb8e7e2a4b2a926d6f': '--l3-button-secondary-content', // component/button/secondary/content
  '59f5edbf23eb0e7944789434472ba52c9b44fe79': '--l3-button-secondary-border', // component/button/secondary/border
  '31c7fe863ac912bcd16153f4395485bbd6a6bc37': '--l3-button-ghost-content', // component/button/ghost/content
  '02857c159e8807eb5244a0b5f690f8f53e954b9c': '--l3-button-brand-surface-disabled', // component/button/brand/surface-disabled
  '1370f692a8df1b7643c899c040c5dd8827c107da': '--l3-button-brand-content-disabled', // component/button/brand/content-disabled
  'ece6abaa2ab14b63a9de091bf25f57d41a6f9fe3': '--l3-button-primary-surface-disabled', // component/button/primary/surface-disabled
  '7f4d7b050c3563b0b148359fba92de42098aa38e': '--l3-button-primary-content-disabled', // component/button/primary/content-disabled
  '270a51c8197af6cb7ce24724612b1457afab395c': '--l3-button-secondary-surface-disabled', // component/button/secondary/surface-disabled
  'd2f3e66d3e8650d1fa34be8c4a6a1e21779e71c1': '--l3-button-secondary-content-disabled', // component/button/secondary/content-disabled
  '693f05b65e51face84000285d008f38fa8e3dc05': '--l3-button-secondary-border-disabled', // component/button/secondary/border-disabled
  '5411a64c62a50401613dc5e134b374aeee690342': '--l3-button-ghost-content-disabled', // component/button/ghost/content-disabled
  '73a0c075079d2f151d451e810e513d610f2137f9': '--l3-button-brand-surface-loading', // component/button/brand/surface-loading
  '68518d4e493f243c9102d5172a097cf730d98c44': '--l3-button-brand-content-loading', // component/button/brand/content-loading
  '82632cdfe00982c1b361035b7b608b457f978117': '--l3-button-primary-surface-loading', // component/button/primary/surface-loading
  '174e3462e3d56bb84425dd7269f741910f4ff916': '--l3-button-primary-content-loading', // component/button/primary/content-loading
  '83932f8dedd8c7b1ea01560be8f22c1c59387ccd': '--l3-button-secondary-surface-loading', // component/button/secondary/surface-loading
  '65d74f0518b855b73992bafb9ab1a5e4b5b2ed90': '--l3-button-secondary-content-loading', // component/button/secondary/content-loading
  '19b081c7ca9b4e1906d1ca3205ca223f8869afc7': '--l3-button-secondary-border-loading', // component/button/secondary/border-loading
  '25681c056d52c015b5473a97b8d063c225c3da32': '--l3-button-ghost-content-loading', // component/button/ghost/content-loading
  '4346117b5f610ad5a0f160cfcc0872fdcc7651ad': '--l3-state-layer-light-default', // component/state-layer/light/default
  'a993579da0fb63428f03d80a2949742964c49666': '--l3-state-layer-light-hover', // component/state-layer/light/hover
  'ed8af7dd8d7f42b2bd43b57d1a9da210fffa06ba': '--l3-state-layer-light-pressed', // component/state-layer/light/pressed
  'c06a9aca7ba435dbf9f6d2d7ca3f45681d3c2a6e': '--l3-state-layer-dark-default', // component/state-layer/dark/default
  '1b7ebcb1d076b5d5ecc4d274625eb9c7212dd377': '--l3-state-layer-dark-hover', // component/state-layer/dark/hover
  'aad98e1a10daebf19324f46a31032b8480aaafb5': '--l3-state-layer-dark-pressed', // component/state-layer/dark/pressed
  'c42d48dae98241414771c31b8a12d1530e203fbf': '--l3-content-inverted-secondary', // content/inverted-secondary
  'a81b33a1e84d7faac5d1cfdfed69152e999f528c': '--l3-button-tertiary-surface', // component/button/tertiary/surface
  'b371e915f46845b5a8a7b5ca32a445a6619c0716': '--l3-button-tertiary-content', // component/button/tertiary/content
  'bab96b7b3d6f79dc6f2010aa69e588412cdb4931': '--l3-button-tertiary-border', // component/button/tertiary/border
  '0c778d703c66d405e9853efd08084fd00e770cd6': '--l3-button-tertiary-surface-loading', // component/button/tertiary/surface-loading
  'e150b9f67cebe8b28bdfce9b201793c093080ec5': '--l3-button-tertiary-content-loading', // component/button/tertiary/content-loading
  '0b55bc2a52a18c0f617aa0afdf2bcbd703f04edd': '--l3-button-tertiary-border-loading', // component/button/tertiary/border-loading
  '7cd19e447a8d7f1ad0c1e976927954ca0be4f38a': '--l3-button-tertiary-surface-disabled', // component/button/tertiary/surface-disabled
  'b980e945c13bbb692a30db9ea55d77c7fc8ca0b3': '--l3-button-tertiary-content-disabled', // component/button/tertiary/content-disabled
  '3ac768996b74fcd2cbbd8598b16d7aa5c138c17a': '--l3-button-tertiary-border-disabled', // component/button/tertiary/border-disabled
  '91dae13ef868aac2626a9caeb524993c1afea274': '--l3-button-buy-surface', // component/button/buy/surface
  'c11fddfeb210af594e10c5bd25d2489a7a585155': '--l3-button-buy-content', // component/button/buy/content
  '8bbb4ed1dbd755e4c41111d6176a964f1a24a104': '--l3-button-buy-surface-loading', // component/button/buy/surface-loading
  '1f21bd1f7f0dba350c086d5299d82bb8f90ce0ed': '--l3-button-buy-content-loading', // component/button/buy/content-loading
  'cef445bc85a0653cdccce439561a9e05e70b8a6e': '--l3-button-buy-surface-disabled', // component/button/buy/surface-disabled
  '1d01b09aefa0061c3934b60e482a517f6affd08e': '--l3-button-buy-content-disabled', // component/button/buy/content-disabled
  '4602f64a2b80ab472b3f44f8061b99b9b8d0a7b3': '--l3-button-sell-surface', // component/button/sell/surface
  '0cc020297c8b4cb79d7a67420c8e34517e8fbfc0': '--l3-button-sell-content', // component/button/sell/content
  '71655dd5ef9d99c0341f9b733176204555f640ad': '--l3-button-sell-surface-loading', // component/button/sell/surface-loading
  '95a45a39d267073e22a9e17e5427604937226a53': '--l3-button-sell-content-loading', // component/button/sell/content-loading
  '1946e9b53866d6235cb10054d7ef76b8d6ddec5a': '--l3-button-sell-surface-disabled', // component/button/sell/surface-disabled
  '96e8cb89cfb1c7607674ed4f8b00a2c9499fe16a': '--l3-button-sell-content-disabled', // component/button/sell/content-disabled
  '7d1c8033c4a36a9adfbfc0c2c5b7de43e4e376a0': '--l3-surface-overlay', // surface/overlay
  '82f25300b8ece9a130ceebb809772879ea254d30': '--l3-gradient-stop-0-static-white', // gradient-stop-0/static/white
  '55853fdbd2d1d5d9c9d27d763226f8038a60677c': '--l3-gradient-stop-0-static-black', // gradient-stop-0/static/black
}
