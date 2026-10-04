# DSH 0.2 compatibility

This release requires DSH 0.2.1-alpha.1 or a compatible 0.2 release. The verified upstream revision is 5badb15009ae1756c3afe0ae0cef1faafc290ccc.

The turn-tail contribution uses the list slot with a stable id. The component selects interrupted turns, and the Host validates the session id and emits a branded plugin-origin message.

Install the fixed commit reachable from the repository main branch through dsh plugin. The shared environment stores full commit ids; local source paths are not portable plugin pins.

The maintenance lockfile disables implicit peer installation and uses the current Cordis and schemastery versions. Git packages build without depending on the source checkout node_modules.
