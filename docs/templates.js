(function() {
  'use strict';

  var globals = typeof global === 'undefined' ? self : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = {}.hasOwnProperty;

  var expRe = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (expRe.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var hot = hmr && hmr.createHot(name);
    var module = {id: name, exports: {}, hot: hot};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var expandAlias = function(name) {
    var val = aliases[name];
    return (val && name !== val) ? expandAlias(val) : name;
  };

  var _resolve = function(name, dep) {
    return expandAlias(expand(dirname(name), dep));
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = expandAlias(name);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    throw new Error("Cannot find module '" + name + "' from '" + loaderPath + "'");
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  var extRe = /\.[^.\/]+$/;
  var indexRe = /\/index(\.[^\/]+)?$/;
  var addExtensions = function(bundle) {
    if (extRe.test(bundle)) {
      var alias = bundle.replace(extRe, '');
      if (!has.call(aliases, alias) || aliases[alias].replace(extRe, '') === alias + '/index') {
        aliases[alias] = bundle;
      }
    }

    if (indexRe.test(bundle)) {
      var iAlias = bundle.replace(indexRe, '');
      if (!has.call(aliases, iAlias)) {
        aliases[iAlias] = bundle;
      }
    }
  };

  require.register = require.define = function(bundle, fn) {
    if (bundle && typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
      delete cache[bundle];
      addExtensions(bundle);
    }
  };

  require.list = function() {
    var list = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        list.push(item);
      }
    }
    return list;
  };

  var hmr = globals._hmr && new globals._hmr(_resolve, require, modules, cache);
  require._cache = cache;
  require.hmr = hmr && hmr.wrap;
  require.brunch = true;
  globals.require = require;
})();

(function() {
var global = typeof window === 'undefined' ? this : window;
var __makeRelativeRequire = function(require, mappings, pref) {
  var none = {};
  var tryReq = function(name, pref) {
    var val;
    try {
      val = require(pref + '/node_modules/' + name);
      return val;
    } catch (e) {
      if (e.toString().indexOf('Cannot find module') === -1) {
        throw e;
      }

      if (pref.indexOf('node_modules') !== -1) {
        var s = pref.split('/');
        var i = s.lastIndexOf('node_modules');
        var newPref = s.slice(0, i).join('/');
        return tryReq(name, newPref);
      }
    }
    return none;
  };
  return function(name) {
    if (name in mappings) name = mappings[name];
    if (!name) return;
    if (name[0] !== '.' && pref) {
      var val = tryReq(name, pref);
      if (val !== none) return val;
    }
    return require(name);
  }
};
require.register("apps/cardEditor/about.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"rows frame\">\n\t<div class = \"row margin\">\n\t\t<img class = \"margin\" src = \"/sm/player-48-24bit.png\" />\n\t\t<h1>Card Editor</h1>\n\t</div>\n\t<div class = \"inset liquid\">\n\t\t<div class = \"scroll margin white liquid rows\">\n\t\t\t<p>&copy; 2021 Sean Morris</p>\n\t\t\t<p>Developed with support from Alex Haussmann.</p>\n\t\t\t<p><a cv-link>Github</a></p>\n\t\t\t<p>--</p>\n<pre>Apache License\nVersion 2.0, January 2004\nhttp://www.apache.org/licenses/\n\nTERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION\n\n1. Definitions.\n\n\"License\" shall mean the terms and conditions for use, reproduction,\nand distribution as defined by Sections 1 through 9 of this document.\n\n\"Licensor\" shall mean the copyright owner or entity authorized by\nthe copyright owner that is granting the License.\n\n\"Legal Entity\" shall mean the union of the acting entity and all\nother entities that control, are controlled by, or are under common\ncontrol with that entity. For the purposes of this definition,\n\"control\" means (i) the power, direct or indirect, to cause the\ndirection or management of such entity, whether by contract or\notherwise, or (ii) ownership of fifty percent (50%) or more of the\noutstanding shares, or (iii) beneficial ownership of such entity.\n\n\"You\" (or \"Your\") shall mean an individual or Legal Entity\nexercising permissions granted by this License.\n\n\"Source\" form shall mean the preferred form for making modifications,\nincluding but not limited to software source code, documentation\nsource, and configuration files.\n\n\"Object\" form shall mean any form resulting from mechanical\ntransformation or translation of a Source form, including but\nnot limited to compiled object code, generated documentation,\nand conversions to other media types.\n\n\"Work\" shall mean the work of authorship, whether in Source or\nObject form, made available under the License, as indicated by a\ncopyright notice that is included in or attached to the work\n(an example is provided in the Appendix below).\n\n\"Derivative Works\" shall mean any work, whether in Source or Object\nform, that is based on (or derived from) the Work and for which the\neditorial revisions, annotations, elaborations, or other modifications\nrepresent, as a whole, an original work of authorship. For the purposes\nof this License, Derivative Works shall not include works that remain\nseparable from, or merely link (or bind by name) to the interfaces of,\nthe Work and Derivative Works thereof.\n\n\"Contribution\" shall mean any work of authorship, including\nthe original version of the Work and any modifications or additions\nto that Work or Derivative Works thereof, that is intentionally\nsubmitted to Licensor for inclusion in the Work by the copyright owner\nor by an individual or Legal Entity authorized to submit on behalf of\nthe copyright owner. For the purposes of this definition, \"submitted\"\nmeans any form of electronic, verbal, or written communication sent\nto the Licensor or its representatives, including but not limited to\ncommunication on electronic mailing lists, source code control systems,\nand issue tracking systems that are managed by, or on behalf of, the\nLicensor for the purpose of discussing and improving the Work, but\nexcluding communication that is conspicuously marked or otherwise\ndesignated in writing by the copyright owner as \"Not a Contribution.\"\n\n\"Contributor\" shall mean Licensor and any individual or Legal Entity\non behalf of whom a Contribution has been received by Licensor and\nsubsequently incorporated within the Work.\n\n2. Grant of Copyright License. Subject to the terms and conditions of\nthis License, each Contributor hereby grants to You a perpetual,\nworldwide, non-exclusive, no-charge, royalty-free, irrevocable\ncopyright license to reproduce, prepare Derivative Works of,\npublicly display, publicly perform, sublicense, and distribute the\nWork and such Derivative Works in Source or Object form.\n\n3. Grant of Patent License. Subject to the terms and conditions of\nthis License, each Contributor hereby grants to You a perpetual,\nworldwide, non-exclusive, no-charge, royalty-free, irrevocable\n(except as stated in this section) patent license to make, have made,\nuse, offer to sell, sell, import, and otherwise transfer the Work,\nwhere such license applies only to those patent claims licensable\nby such Contributor that are necessarily infringed by their\nContribution(s) alone or by combination of their Contribution(s)\nwith the Work to which such Contribution(s) was submitted. If You\ninstitute patent litigation against any entity (including a\ncross-claim or counterclaim in a lawsuit) alleging that the Work\nor a Contribution incorporated within the Work constitutes direct\nor contributory patent infringement, then any patent licenses\ngranted to You under this License for that Work shall terminate\nas of the date such litigation is filed.\n\n4. Redistribution. You may reproduce and distribute copies of the\nWork or Derivative Works thereof in any medium, with or without\nmodifications, and in Source or Object form, provided that You\nmeet the following conditions:\n\n(a) You must give any other recipients of the Work or\nDerivative Works a copy of this License; and\n\n(b) You must cause any modified files to carry prominent notices\nstating that You changed the files; and\n\n(c) You must retain, in the Source form of any Derivative Works\nthat You distribute, all copyright, patent, trademark, and\nattribution notices from the Source form of the Work,\nexcluding those notices that do not pertain to any part of\nthe Derivative Works; and\n\n(d) If the Work includes a \"NOTICE\" text file as part of its\ndistribution, then any Derivative Works that You distribute must\ninclude a readable copy of the attribution notices contained\nwithin such NOTICE file, excluding those notices that do not\npertain to any part of the Derivative Works, in at least one\nof the following places: within a NOTICE text file distributed\nas part of the Derivative Works; within the Source form or\ndocumentation, if provided along with the Derivative Works; or,\nwithin a display generated by the Derivative Works, if and\nwherever such third-party notices normally appear. The contents\nof the NOTICE file are for informational purposes only and\ndo not modify the License. You may add Your own attribution\nnotices within Derivative Works that You distribute, alongside\nor as an addendum to the NOTICE text from the Work, provided\nthat such additional attribution notices cannot be construed\nas modifying the License.\n\nYou may add Your own copyright statement to Your modifications and\nmay provide additional or different license terms and conditions\nfor use, reproduction, or distribution of Your modifications, or\nfor any such Derivative Works as a whole, provided Your use,\nreproduction, and distribution of the Work otherwise complies with\nthe conditions stated in this License.\n\n5. Submission of Contributions. Unless You explicitly state otherwise,\nany Contribution intentionally submitted for inclusion in the Work\nby You to the Licensor shall be under the terms and conditions of\nthis License, without any additional terms or conditions.\nNotwithstanding the above, nothing herein shall supersede or modify\nthe terms of any separate license agreement you may have executed\nwith Licensor regarding such Contributions.\n\n6. Trademarks. This License does not grant permission to use the trade\nnames, trademarks, service marks, or product names of the Licensor,\nexcept as required for reasonable and customary use in describing the\norigin of the Work and reproducing the content of the NOTICE file.\n\n7. Disclaimer of Warranty. Unless required by applicable law or\nagreed to in writing, Licensor provides the Work (and each\nContributor provides its Contributions) on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or\nimplied, including, without limitation, any warranties or conditions\nof TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A\nPARTICULAR PURPOSE. You are solely responsible for determining the\nappropriateness of using or redistributing the Work and assume any\nrisks associated with Your exercise of permissions under this License.\n\n8. Limitation of Liability. In no event and under no legal theory,\nwhether in tort (including negligence), contract, or otherwise,\nunless required by applicable law (such as deliberate and grossly\nnegligent acts) or agreed to in writing, shall any Contributor be\nliable to You for damages, including any direct, indirect, special,\nincidental, or consequential damages of any character arising as a\nresult of this License or out of the use or inability to use the\nWork (including but not limited to damages for loss of goodwill,\nwork stoppage, computer failure or malfunction, or any and all\nother commercial damages or losses), even if such Contributor\nhas been advised of the possibility of such damages.\n\n9. Accepting Warranty or Additional Liability. While redistributing\nthe Work or Derivative Works thereof, You may choose to offer,\nand charge a fee for, acceptance of support, warranty, indemnity,\nor other liability obligations and/or rights consistent with this\nLicense. However, in accepting such obligations, You may act only\non Your own behalf and on Your sole responsibility, not on behalf\nof any other Contributor, and only if You agree to indemnify,\ndefend, and hold each Contributor harmless for any liability\nincurred by, or claims asserted against, such Contributor by reason\nof your accepting any such warranty or additional liability.\n\nEND OF TERMS AND CONDITIONS\n\nAPPENDIX: How to apply the Apache License to your work.\n\nTo apply the Apache License to your work, attach the following\nboilerplate notice, with the fields enclosed by brackets \"[]\"\nreplaced with your own identifying information. (Don't include\nthe brackets!)  The text should be enclosed in the appropriate\ncomment syntax for the file format. We also recommend that a\nfile or class name and description of purpose be included on the\nsame \"printed page\" as the copyright notice for easier\nidentification within third-party archives.\n\nCopyright [yyyy] [name of copyright owner]\n\nLicensed under the Apache License, Version 2.0 (the \"License\");\nyou may not use this file except in compliance with the License.\nYou may obtain a copy of the License at\n\nhttp://www.apache.org/licenses/LICENSE-2.0\n\nUnless required by applicable law or agreed to in writing, software\ndistributed under the License is distributed on an \"AS IS\" BASIS,\nWITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\nSee the License for the specific language governing permissions and\nlimitations under the License.\n</pre>\n\t\t</div>\n\t</div>\n\t<div class = \"row margin centered\">\n\t\t<button class = \"margin\" cv-on = \"click:close();\">ok</button>\n\t</div>\n</div>\n"
});

;require.register("apps/cardEditor/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"form-test frame liquid\" cv-on = \"mousemove\">\n\t<label class = \"margin\">\n\t\t<span>/watch?v=</span>\n\t\t<input class = \"wide inset white\" cv-bind = \"videoId\" placeholder = \"video id\">\n\t</label>\n\n\t<label class = \"margin\">\n\t\t<span>start:&nbsp;</span>\n\t\t<input type = \"number\" min = \"0\" class = \"wide inset white\" cv-bind = \"startTime\" placeholder = \"start time in seconds\">\n\t</label>\n\n\t<label class = \"margin\">\n\t\t<span>volume:&nbsp;([[volume]])&nbsp;</span>\n\t\t<input type = \"range\" min = \"0\" max = \"100\" class = \"wide\" cv-bind = \"volume\">\n\t</label>\n\n\t<label class = \"margin row\">\n\t\t<label class = \"margin\">\n\t\t\t<input type = \"checkbox\" value=\"1\" cv-bind = \"autoplay\" placeholder = \"start time in seconds\">\n\t\t\t<span>autoplay&nbsp;</span>\n\t\t</label>\n\t\t<label class = \"margin\">\n\t\t\t<input type = \"checkbox\" value=\"1\" cv-bind = \"controls\" placeholder = \"start time in seconds\">\n\t\t\t<span>controls&nbsp;</span>\n\t\t</label>\n\t</label>\n\n\t<div class = \"inset liquid\">\n\t\t<div class = \"scroll wide rows\" cv-ref = \"scroller\">\n\n\t\t\t<span class = \"contents\" cv-each = \"cards:props:p\">\n\n\t\t\t\t<div class = \"property-list\">\n\n\t\t\t\t\t<div class = \"header\">\n\t\t\t\t\t\t<span class = \"property\">Card #[[p]]</span>\n\t\t\t\t\t\t<span class = \"property right\"><button cv-on = \"click:removeCard($event, p)\" class = \"tight remove\"></button></span>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<div class = \"contents\" cv-each = \"props:value:key\">\n\t\t\t\t\t\t<label cv-on = \"click:selectProperty($event, key)\">\n\t\t\t\t\t\t\t<span class = \"property\">[[key]]</span><span class = \"value\"><input placeholder = \"Property Value\" cv-bind = \"value\" /><button class = \"remove tight\" cv-on = \"click:removeProperty($event, key, p)\">x</button></span>\n\t\t\t\t\t\t</label>\n\t\t\t\t\t</div>\n\n\t\t\t\t\t<label cv-if = \"adding\">\n\t\t\t\t\t\t<span class = \"property\"><input placeholder = \"New Property Name\" cv-ref = \"newName\" /></span>\n\t\t\t\t\t\t<span>\n\t\t\t\t\t\t\t<button class = \"\" cv-on = \"click:confirmAddProperty($event, $parent, p)\">confirm</button>\n\t\t\t\t\t\t\t<button class = \"\" cv-on = \"click:cancelAddProperty($event, $parent, p)\">cancel</button>\n\t\t\t\t\t\t</span>\n\t\t\t\t\t</label>\n\t\t\t\t\t<label cv-if = \"!adding\">\n\t\t\t\t\t\t<span class = \"property\"><input disabled class = \"dud\" /></span>\n\t\t\t\t\t\t<span><button class = \"\" cv-on = \"click:addProperty($event, $parent)\">add key</button></span>\n\t\t\t\t\t</label>\n\t\t\t\t</div>\n\t\t\t</span>\n\t\t</div>\n\t</div>\n\n\t<div class = \"row margin right\">\n\t\t<button class = \"margin\" cv-on = \"click:newCard\">ADD CARD</button>\n\t</div>\n\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[filename]]&nbsp;</div>\n\t<div class = \"label inset\">[[cardCount]]&nbsp;cards</div>\n</div>\n"
});

;require.register("apps/cgiWorker/about.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"rows frame\">\n\t<div class = \"row margin\">\n\t\t<img class = \"margin\" src = \"/sm/player-48-24bit.png\" />\n\t\t<h1>php-cgi-wasm</h1>\n\t</div>\n\t<div class = \"inset liquid\">\n\t\t<div class = \"scroll margin white\">\n\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec sem leo. Nulla imperdiet felis in arcu lobortis consequat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc porta feugiat risus, blandit mattis lacus scelerisque a. Donec consequat blandit erat ut semper. Donec bibendum auctor imperdiet. Duis ac eleifend leo. Nam bibendum dapibus metus ac suscipit.</p>\n\n\t\t\t<p>Nulla tempus hendrerit libero vel maximus. Ut placerat auctor orci nec elementum. Nunc convallis erat enim, quis ultricies nibh consectetur a. Suspendisse ut consectetur tellus. Nunc sit amet erat vel nunc vestibulum dignissim rutrum ut lectus. Suspendisse dictum mauris ac risus elementum, et interdum metus laoreet. Phasellus a pellentesque mauris, ut cursus elit. Mauris at lorem ut lacus fermentum iaculis vitae nec eros. Duis sed lacus auctor tellus convallis finibus non eget orci. Donec nec scelerisque nisl. Donec consequat libero a ligula dapibus, eget tincidunt mi scelerisque. Etiam malesuada maximus velit eleifend condimentum. Duis sapien dui, pulvinar in ex ut, varius sollicitudin urna.</p>\n\n\t\t\t<p>Quisque feugiat nibh elit, id convallis lectus dignissim ut. Mauris interdum odio maximus, interdum augue ut, varius mi. Integer a hendrerit dui, non auctor nisi. Mauris vel ornare tortor. Suspendisse tempus ligula tempor mi congue consequat pharetra a risus. Cras cursus at lacus nec ornare. Suspendisse eu faucibus augue. Donec interdum lacus ac ex sodales consectetur non vel diam. Praesent vulputate pretium convallis. Vestibulum egestas feugiat nibh nec semper. Praesent rutrum ut sem id viverra. Vestibulum ullamcorper nibh elit, et blandit urna faucibus id. Nulla et nisi sit amet erat dignissim blandit vitae eu quam. Ut scelerisque tempus turpis, et sodales metus. Nulla sagittis nulla et tristique blandit. Morbi non iaculis quam.</p>\n\n\t\t\t<p>Donec turpis purus, porta et cursus ultricies, egestas in tellus. Sed pretium, mi quis ultrices tristique, turpis sem mattis nisl, at suscipit ligula nunc vitae lectus. Phasellus vehicula ex sit amet massa efficitur vulputate. Nunc euismod sapien at augue pellentesque accumsan. Maecenas porttitor commodo hendrerit. Aenean luctus mauris et magna sagittis, sit amet malesuada nunc malesuada. Sed non urna leo. Nulla malesuada nisl id velit hendrerit auctor. Cras mattis aliquet hendrerit. In sollicitudin nunc ac facilisis molestie. Suspendisse potenti. Vivamus turpis lorem, vehicula a est et, porttitor congue tellus.</p>\n\n\t\t\t<p>Sed vitae nisi sed erat dignissim elementum. Integer vitae enim a ante aliquam fringilla. In enim sapien, iaculis ac ante vitae, placerat hendrerit nisi. Morbi faucibus dui a tristique interdum. Maecenas vitae augue sagittis, maximus sem sed, malesuada turpis. Cras vitae nibh justo. Suspendisse convallis pretium orci, in aliquam ante cursus et. Fusce dictum efficitur mauris sit amet pretium. Praesent eu sem gravida, euismod neque et, metus.</p>\n\t\t</div>\n\t</div>\n\t<div class = \"row margin\">\n\t\t<p>&copy; 2020 - 2024 Sean Morris</p>\n\t</div>\n\t<div class = \"row margin centered\">\n\t\t<button class = \"margin\" cv-on = \"click:close();\">ok</button>\n\t</div>\n</div>\n"
});

;require.register("apps/cgiWorker/dialog.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"rows padded wide\">\n\n\t<div class = \"cols wide\">\n\n\t\t<div class = \"rows wide\">\n\t\t\t<div class = \"cols row nowrap padded\">\n\t\t\t\t[[headerIcon]]\n\t\t\t\t<div class = \"rows\">\n\t\t\t\t\t<h1 class = \"tight\">Cgi Service Worker</h1>\n\n\t\t\t\t\t<span class = \"row normal-align\" cv-if = \"started\">\n\t\t\t\t\t\t[[runningIcon]]&nbsp;\n\t\t\t\t\t\t<span>Cgi worker is running.</span>&nbsp;\n\t\t\t\t\t\t<a href = \"/php-wasm/drupal\" target=\"_blank\">Open Site</a>\n\t\t\t\t\t</span>\n\n\t\t\t\t\t<span class = \"row normal-align\" cv-if = \"!started\">\n\t\t\t\t\t\t[[stoppedIcon]]&nbsp;\n\t\t\t\t\t\t<span>Cgi worker is NOT running!</span>\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\n\t\t\t<div class = \"stretch-children cols\">\n\n\t\t\t\t<div class = \"inset scroll abs-holder tall wide padded col rows\">\n\t\t\t\t\t<div class =\"abs-fill scroll status-log\" cv-each = \"log:line\">\n\t\t\t\t\t\t<div  cv-with = \"line\"><div data-status-code = \"[[status]]\">[[text]]</div></div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>\n\n\t\t\t\t<div class = \"vertical-separator\"></div>\n\n\t\t\t\t<div class = \"rows tight lower\">\n\t\t\t\t\t<button class = \"padded\" cv-on = \"click:startService\">Start</button>\n\t\t\t\t\t<button class = \"padded\" cv-on = \"click:stopService\">Stop</button>\n\t\t\t\t\t<button class = \"padded\" cv-on = \"click:about\">About</button>\n\t\t\t\t\t<button class = \"padded\">Donate</button>\n\t\t\t\t</div>\n\n\t\t\t</div>\n\n\t\t</div>\n\n\t</div>\n\n</div>\n"
});

;require.register("apps/clippy/main.tmp.html", function(exports, require, module) {
module.exports = "<div cv-on = \"mousedown:grabTitleBar(event);\" class = \"clippy\"></div>\n"
});

;require.register("apps/clonesNBarrels/main.tmp.html", function(exports, require, module) {
module.exports = "<iframe\n\tsrc    = \"[[src]]\"\n\tclass  = \"inset liquid\"\n\tcv-ref = \"frame::\"\n></iframe>\n"
});

;require.register("apps/console/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"abs-holder console inset liquid\">\n<div class = \"abs-fill\" cv-ref = \"term::\" >\n\t[[console]]\n</div>\n</div>\n"
});

;require.register("apps/cubes/barrel-hole.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\tdata-colliding = \"[[colliding]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube [[css]]\"\n>\n\t<div class = \"texture top\"></div>\n\t<div class = \"texture indicator\"></div>\n</div>\n"
});

;require.register("apps/cubes/box.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\n\tdata-colliding = \"[[colliding]]\"\n\tdata-interior  = \"[[interior]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-solid     = \"[[solid]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube [[css]]\"\n\tcv-on          = \"click:spray(event)\"\n>\n\t<div class = \"texture bottom\"></div>\n\t<div class = \"texture top\"></div>\n\t<div class = \"texture front\"></div>\n\t<div class = \"texture back\">\n\t\t<!-- <iframe src=\"https://www.youtube.com/embed/HW-heSo9580?start=644\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe> -->\n\t</div>\n\t<div class = \"texture left\">\n\t\t<!-- <div class = \"frame\">\n\t\t\t<p>This is only a test form</p>\n\t\t\tUsername:\n\t\t\t<input type = \"text\">\n\t\t\tPassword:\n\t\t\t<input type = \"password\">\n\t\t\t<input type = \"submit\">\n\t\t</div> -->\n\t</div>\n\t<div class = \"texture right\">\n\t\t<!-- <iframe src=\"http://pixel-physics.seanmorr.is?map=empty-zone.json\"> -->\n\t\t<!-- <iframe class = \"virtual-screen\" src=\"http://localhost:3333/\"> -->\n\t</div>\n\t<div class = \"texture direction\"></div>\n\t<div class = \"texture indicator\"></div>\n\t<div class = \"texture flat face-[[face]]\"></div>\n</div>\n"
});

;require.register("apps/cubes/coin.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\tdata-colliding = \"[[colliding]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube [[css]]\"\n>\n\t<div class = \"texture flat face-[[face]]\"></div>\n</div>\n"
});

;require.register("apps/cubes/cube.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\n\n\tdata-colliding = \"[[colliding]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube [[css]]\"\n\tcv-on          = \"click:spray(event)\"\n>\n\t<div class = \"texture top\"></div>\n\t<div class = \"texture front\"></div>\n\t<div class = \"texture back\"></div>\n\t<div class = \"texture left\"></div>\n\t<div class = \"texture right\"></div>\n\t<div class = \"texture bottom\"></div>\n\t<div class = \"texture direction\"></div>\n\t<div class = \"texture indicator\"></div>\n\t<div class = \"texture flat face-[[face]]\"></div>\n</div>\n"
});

;require.register("apps/cubes/main.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tcv-on = \"mouseup:lockMouse\"\n\tclass = \"liquid inset frame cubes\"\n\tdata-outlines = \"[[outlines]]\"\n\tdata-exterior = [[exterior]]\n\tstyle = \"--x3d:[[x3d]];--y3d:[[y3d]];--z3d:[[z3d]];--xCam3d:[[xCam3d]];--yCam3d:[[yCam3d]];--zCam3d:[[zCam3d]];--xCamTilt3d:[[xCamTilt3d]];--yCamTilt3d:[[yCamTilt3d]];--zCamTilt3d:[[zCamTilt3d]];--xBound:[[xBound]];--zBound:[[zBound]];\"\n>\n\t<div class = \"world\">\n\n\t\t<span class = \"contents\" cv-each = \"cubes:cube\">\n\t\t\t[[cube]]\n\t\t</span>\n\n\t\t<div class = \"ground texture\">\n\t\t\t<div class = \"panel-row\">\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<!-- <div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div> -->\n\t\t\t</div>\n\t\t\t<div class = \"panel-row\">\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<!-- <div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div> -->\n\t\t\t</div>\n\t\t\t<div class = \"panel-row\">\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<!-- <div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div> -->\n\t\t\t</div>\n\t\t\t<div class = \"panel-row\">\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div>\n\t\t\t\t<!-- <div class = \"panel\"></div>\n\t\t\t\t<div class = \"panel\"></div> -->\n\t\t\t</div>\n\n\t\t\t<div class = \"ground texture collision-zone\"></div>\n\t\t</div>\n\n\n\n\t</div>\n\n<div class = \"hud\"></div>\n\n<div class = \"coin-count\">[[coinCount]]</div>\n<div class = \"frame\">[[frame]]</div>\n\n</div>\n"
});

;require.register("apps/cubes/slope.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\tdata-colliding = \"[[colliding]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-solid     = \"[[solid]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube slope [[css]]\"\n\tcv-on          = \"click:spray(event)\"\n>\n\t<div class = \"texture top\"></div>\n\t<div class = \"texture front\"></div>\n\t<div class = \"texture back\">\n\t\t<!-- <iframe src=\"https://www.youtube.com/embed/HW-heSo9580?start=644\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe> -->\n\t</div>\n\t<div class = \"texture left\">\n\t\t<!-- <div class = \"frame\">\n\t\t\t<p>This is only a test form</p>\n\t\t\tUsername:\n\t\t\t<input type = \"text\">\n\t\t\tPassword:\n\t\t\t<input type = \"password\">\n\t\t\t<input type = \"submit\">\n\t\t</div> -->\n\t</div>\n\t<div class = \"texture right\">\n\t\t<!-- <iframe src=\"http://pixel-physics.seanmorr.is?map=empty-zone.json\"> -->\n\t\t<!-- <iframe class = \"virtual-screen\" src=\"http://localhost:3333/\"> -->\n\t</div>\n\t<!-- <div class = \"texture direction\"></div> -->\n\t<!-- <div class = \"texture indicator\"></div> -->\n\t<!-- <div class = \"texture flat face-[[face]]\"></div> -->\n</div>\n"
});

;require.register("apps/cubes/wall.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle = \"--x:[[x]];--y:[[y]];--z:[[z]];\n\t--w: [[w]]; --h:  [[h]]; --d:  [[d]];\n\t--rad: [[rad]]; --size: [[size]];\"\n\n\tdata-colliding = \"[[colliding]]\"\n\tdata-walking   = \"[[walking]]\"\n\tdata-state     = \"[[state]]\"\n\tclass          = \"cube [[css]]\"\n\tcv-on          = \"click:spray(event)\"\n>\n\t<!-- <div class = \"texture top\"></div> -->\n\t<div class = \"texture front\">\n\t\t<div class = \"billboard\">\n\t\t\t<div>[[billboard]]</div>\n\t\t</div>\n\t</div>\n\t<div class = \"texture back\"></div>\n\t<div class = \"texture left\"></div>\n\t<div class = \"texture right\"></div>\n\t<!-- <div class = \"texture bottom\"></div>\n\t<div class = \"texture direction\"></div>\n\t<div class = \"texture indicator\"></div>\n\t<div class = \"texture flat face-[[face]]\"></div> -->\n</div>\n"
});

;require.register("apps/dialog/dialog.html", function(exports, require, module) {

});

;require.register("apps/dosbox/main.tmp.html", function(exports, require, module) {
module.exports = "<canvas class = \"liquid inset\"></canvas>\n"
});

;require.register("apps/drupal/init.tmp.php", function(exports, require, module) {
module.exports = "<?php // {\"autorun\":true, \"persist\":false, \"single-expression\": false, \"render-as\": \"html\"}\nini_set('session.save_path', '/persist');\n\n$stdErr = fopen('php://stderr', 'w');\n$errors = [];\n\nset_error_handler(function(...$args) use($stdErr, &$errors){\n\tfwrite($stdErr, print_r($args,1));\n});\n\n$docroot = '/persist/drupal-7.95';\n$path    = '/node';\n$script  = 'index.php';\n\nif(1||!is_dir($docroot))\n{\n    $it = new RecursiveIteratorIterator(new RecursiveDirectoryIterator(\"/preload/drupal-7.95/\", FilesystemIterator::SKIP_DOTS));\n    foreach ($it as $name => $entry)\n    {\n        if(is_dir($name)) continue;\n        $fromDir = dirname($name);\n        $toDir  = '/persist' . substr($fromDir, 8);\n        $filename = basename($name);\n    \t$pDirs = [$pDir = $toDir];\n    \twhile($pDir !== dirname($pDir)) $pDirs[] = $pDir = dirname($pDir);\n    \t$pDirs = array_reverse($pDirs);\n    \tforeach($pDirs as $pDir) if(!is_dir($pDir)) mkdir($pDir, 0777);\n\t\tprint($toDir  . '/' . $filename . PHP_EOL);\n    \tvar_dump(unlink($toDir  . '/' . $filename));\n    \tfile_put_contents($toDir  . '/' . $filename, file_get_contents($fromDir . '/' . $filename));\n    }\n}\n\nexit;\n\n$_SERVER['REQUEST_URI']     = '/php-wasm' . $docroot . $path;\n$_SERVER['REMOTE_ADDR']     = '127.0.0.1';\n$_SERVER['SERVER_NAME']     = 'localhost';\n$_SERVER['SERVER_PORT']     = 3333;\n$_SERVER['REQUEST_METHOD']  = 'GET';\n$_SERVER['SCRIPT_FILENAME'] = $docroot . '/' . $script;\n$_SERVER['SCRIPT_NAME']     = $docroot . '/' . $script;\n$_SERVER['PHP_SELF']        = $docroot . '/' . $script;\n\nchdir($docroot);\n\nif(!defined('DRUPAL_ROOT')) define('DRUPAL_ROOT', getcwd());\n\nrequire_once DRUPAL_ROOT . '/includes/bootstrap.inc';\ndrupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);\ndrupal_session_start();\n\nfwrite($stdErr, json_encode(['session_id' => session_id()]) . \"\\n\");\n\nglobal $user;\n\n$uid     = 1;\n$user    = user_load($uid);\n$account = array('uid' => $user->uid);\n$session_name = session_name();\n\nif(!$_COOKIE || !$_COOKIE[$$session_name])\n{\n\tuser_login_submit(array(), $account);\n}\n\n$itemPath = $path;\n$itemPath = preg_replace('/^\\\\//', '', $path);\n\n$GLOBALS['base_path'] = '/php-wasm' . $docroot . '/';\n$base_url = '/php-wasm' . $docroot;\n\n$_GET['q'] = $itemPath;\n\nmenu_execute_active_handler();\n\nfwrite($stdErr, json_encode(['HEADERS' =>headers_list()]) . \"\\n\");\nfwrite($stdErr, json_encode(['COOKIE'  => $_COOKIE]) . PHP_EOL);\nfwrite($stdErr, json_encode(['errors'  => error_get_last()]) . \"\\n\");\n"
});

;require.register("apps/drupal/main.tmp.html", function(exports, require, module) {
module.exports = "<iframe class = \"inset liquid\" cv-ref = \"frame::\" srcdoc = \"[[content]]\"></iframe>\n"
});

;require.register("apps/fileBrowser/main.tmp.html", function(exports, require, module) {
module.exports = "<hr />\n\n<div class = \"row\">\n\t<input class = \"white inset wide\" list = \"dirmenu_[[_id]]\" value = \"[[directory]]\">\n\t<datalist id = \"dirmenu_[[_id]]\">\n\t\t<option value = \"[[directory]]\">\n\t\t<option value = \".\">\n\t\t<option value = \"..\">\n\t</datalist>\n</div>\n\n<span cv-if = \"promptAction\">\n\t<div class = \"row padded\">\n\t\t<span class = \"square\">\n\t\t\t<img src = \"/w98/msg_question-16-4bit.png\" />\n\t\t</span>\n\t\t<span class = \"prompt h-margin small\">What action should run for ${XYZ} files?</span>\n\t\t<div class = \"row tight wide\">\n\t\t\t<input class = \"inset white wide\" cv-bind = \"defaultAction\">\n\t\t\t<button>save and run</button>\n\t\t</div>\n\t</div>\n</span>\n\n<div data-control-sector class = \"white inset scroll\" cv-on = \"dragover(event);drop(event)\">\n\t<div class = \"liquid abs-holder [[viewRaw]]\">\n\t\t<div class = \"abs-fill control\">\n\t\t\t[[iconList]]\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label liquid inset\">[[selectedFilename]]&nbsp;</div>\n\t<div class = \"label liquid inset\">\n\t\t<span cv-if = \"selectedFileType\">type: [[selectedFileType]]</span>&nbsp;\n\t</div>\n\t<div class = \"label liquid inset\">\n\t\t<span cv-if = \"selectedFileSize\">size: [[selectedFileSize]]</span>&nbsp;\n\t</div>\n</div>\n"
});

;require.register("apps/gitHub/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \" liquid inset main-content image-control\">\n\t<img src = \"/loading.gif\" />\n\tLogging into github...\n</div>\n"
});

;require.register("apps/harp/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<iframe class = \"inset liquid\" src=\"[[src]]\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">Welcome to OpenHarp!</div>\n\t<div class = \"label inset\">:)</div>\n</div>\n"
});

;require.register("apps/iconExplorer/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"row\">\n\t<div class = \"spacer\"></div>\n\t<label class = \"icon-label\">16x16<br />[[smallSrc]]</label>\n\t<label class = \"inset icon-frame\" cv-ref = \"small-icon\">\n\t\t[[small]]\n\t</label>\n\t<label class = \"icon-label\">32x32<br />[[largeSrc]]</label>\n\t<label class = \"inset icon-frame\" cv-ref = \"large-icon\">\n\t\t[[large]]\n\t</label>\n</div>\n\n<div class = \"frame white inset scroll margin\">\n\t<div data-role = \"icon-list\" cv-each = \"icons:iicon:i\">[[iicon]]</div>\n</div>\n\n<!-- <div class = \"row\">\n\t<label>\n\t\t[[progr]]%\n\t</label>\n\t<progress  class = \"inset\" value=\"[[progr]]\" max=\"100\">\n</div> -->\n\n<div class = \"status row\">\n\t<div class = \"label inset\">Showing: Icons</div>\n</div>\n"
});

;require.register("apps/imageViewer/image-viewer.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"image-viewer frame inset scroll\">\n\t<span cv-if = \"src\">\n\t\t<img src = \"[[src]]\" />\n\t</span>\n</div>\n"
});

;require.register("apps/letsvue/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<iframe class = \"inset liquid\" src=\"[[src]]\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">Welcome to Letsvue!</div>\n\t<div class = \"label inset\">:)</div>\n</div>\n"
});

;require.register("apps/npmUnpkgr/main.tmp.html", function(exports, require, module) {
module.exports = "<label class = \"row\">\n\t[[searchIcon]]\n\tSearch:\n\t<form class = \"wide\" cv-on = \"submit:search(event)\">\n\t\t<input cv-bind = \"query\" type = \"text\" class = \"wide\">\n\t\t<button cv-on = \"click:search(event)\">go</button>\n\t</form>\n</label>\n\n<div class = \"white inset scroll liquid\">\n\t<div data-role = \"icon-list\" cv-each = \"icons:icon:i\">[[icon]]</div>\n</div>\n\n<span cv-if = \"name\">\n\t<div class = \"row pane padded\">\n<!-- \t\t<div class = \"rows\">\n\t\t\t<button>Install</button>\n\t\t\t<button>Browse</button>\n\t\t\t<button>Info</button>\n\t\t</div> -->\n\t\t<div>\n\t\t\t<span style = \"font-size: x-large;\">[[name]]</span><br />\n\t\t\t<span>[[version]]</span><br />\n\t\t\t<span>[[description]]</span><br />\n\t\t</div>\n\t</div>\n</span>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[status]]</div>\n</div>\n"
});

;require.register("apps/numb/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"container\">\n\t<div class = \"cards\" cv-each = \"cards:card\">[[card]]</div>\n\t<iframe class = \"inset liquid\" cv-attr = \"src\" frameborder=\"0\" allow=\"accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture\" allowfullscreen></iframe>\n\t<!-- <div class = \"sheild\"></div> -->\n</div>\n\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[filename]]&nbsp;</div>\n\t<div class = \"label inset\">&nbsp;</div>\n</div>\n"
});

;require.register("apps/nynemark/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<textarea cv-bind = \"document\" class = \"inset liquid\"></textarea>\n</div>\n\n<!-- <div class = \"status row\">\n\t<div class = \"label inset\">untitled</div>\n\t<div class = \"label inset\">[[charCount]]</div>\n</div>\n -->\n"
});

;require.register("apps/nynepad/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\">\n\t<textarea cv-bind = \"document\" cv-ref = \"field\" class = \"inset white liquid scroll\" spellcheck = \"[[spellCheck]]\" data-wrapping = \"[[wrapping]]\"></textarea>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[filename]]</div>\n\t<div class = \"label inset\">[[charCount]] bytes</div>\n</div>\n"
});

;require.register("apps/phpEditor/php-editor.tmp.html", function(exports, require, module) {
module.exports = "<div>\n\t<div class = \"cols\">\n<!-- \t\t<div class = \"row tight tabs\">\n\t\t\t<div cv-on = \"click:modeTo('script')\" class = \"tab script\" tabindex=\"0\">script</div>\n\n\t\t\t<div cv-on = \"click:modeTo('term')\" class = \"tab term\" tabindex=\"0\">terminal</div>\n\t\t</div> -->\n\n\t\t<div class = \"spaced row wide right\">\n\n\t\t\t<span class = \"contents\">Change View&nbsp;</span>\n\n\t\t\t<span class = \"contents\" data-mode-script>\n\t\t\t\t<button cv-on = \"click:layout('horizontal')\" title = \"horizontal view\" class = \"square\">\n\t\t\t\t\t<img src = \"/ui/application-split-vertical.png\" />\n\t\t\t\t</button>\n\n\t\t\t\t<button cv-on = \"click:layout('vertical')\" title = \"vertical view\" class = \"square\">\n\t\t\t\t\t<img src = \"/ui/application-split.png\" />\n\t\t\t\t</button>\n\n\t\t\t\t<button cv-on = \"click:layout('quad')\" title = \"quad view\" class = \"square\">\n\t\t\t\t\t<img src = \"/ui/application-split-tile.png\" />\n\t\t\t\t</button>\n\n\t\t\t\t&nbsp;\n\n\t\t\t\t<hr />\n\n\t\t\t\t&nbsp;\n\t\t\t</span>\n\n\t\t\t<span cv-if = \"persist\" class = \"contents\">\n\t\t\t\t<button cv-on = \"click:refresh(event)\" class = \"square\" title = \"refresh\">\n\t\t\t\t\t<span cv-if = \"persist\" class = \"contents\">\n\t\t\t\t\t\t<img src = \"/arrow-circle.png\" />\n\t\t\t\t\t\t<span>Refresh Memory</span>\n\t\t\t\t\t</span>\n\t\t\t\t\t<span cv-if = \"!persist\" class = \"contents\">\n\t\t\t\t\t\t<img src = \"/arrow-circle.png\" class = \"desat\" />\n\t\t\t\t\t\t<span>Refresh Memory</span>\n\t\t\t\t\t</span>\n\t\t\t\t</button>\n\t\t\t</span>\n\n\t\t\t<button cv-on = \"click:toggle('persist')\" class = \"square\" title = \"toggle persistent memory\">\n\t\t\t\t<span cv-if = \"persist\" class = \"contents\">\n\t\t\t\t\t<img src = \"/w98/memory-16-4bit.png\" />\n\t\t\t\t\t<span>Persist Memory</span>\n\t\t\t\t</span>\n\t\t\t\t<span cv-if = \"!persist\" class = \"contents ghost\">\n\t\t\t\t\t<img src = \"/w98/memory-16-4bit.png\" class = \"desat\" />\n\t\t\t\t\t<span>Persist Memory</span>\n\t\t\t\t</span>\n\t\t\t\t<input type = \"checkbox\" cv-bind = \"persist\" data-no-click>\n\t\t\t</button>\n\n\t\t\t<button cv-on = \"click:runCode(event)\" class = \"square\" title = \"Execute PHP\" cv-ref = \"runButton\" data-tint = \"green\">\n\t\t\t\t<span class = \"contents\">\n\t\t\t\t\t<img src = \"/w98/chip_ramdrive-16-8bit.png\" class = \"desat\" style = \"position: relative; top: -1px;\" />\n\t\t\t\t\t<span>Execute PHP</span>\n\t\t\t\t</span>\n\t\t\t</button>\n<!--\n\t\t\t<button class = \"square\"  title = \"help\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/help_book_small-16-4bit.png\" />\n\t\t\t</button> -->\n\n\t\t</div>\n\n\t</div>\n</div>\n\n<div data-layout = \"[[layout]]\" class = \"main tight liquid\" data-mode-script>\n\n\t<div class = \"code tight liquid\">\n\n\t\t<div class = \"rows inset wide scroll zfront\">\n\t\t\t<div class = \"cols tight\">\n\t\t\t\t<label class = \"pane wide\">PHP Code</label>\n\t\t\t</div>\n\n\t\t\t<div class = \"wide scroll zfront\">\n\t\t\t\t<textarea name = \"php-source\" data-php rows = \"14\" spellcheck=\"false\" cv-bind = \"input\"></textarea>\n\t\t\t</div>\n\t\t</div>\n\n\n\t</div>\n\n\t<div data-section-right data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n\t<div data-section-right data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event)\"></div>\n\n\t<div class = \"terms tight liquid resize-container\" data-readonly>\n\n\t\t<div class = \"rows inset wide zfront\">\n\t\t\t<div class = \"cols tight\">\n\t\t\t\t<label class = \"pane wide\">StdOut</label>\n\t\t\t\t<button cv-on = \"click:toggle('html')\" class = \"pane tight\">\n\t\t\t\t\t<span cv-if = \"!html\">HTML</span>\n\t\t\t\t\t<span cv-if = \"!html\">Text</span>\n\t\t\t\t\tText\n\t\t\t\t</button>\n\t\t\t</div>\n\t\t\t<span class = \"contents\" cv-if = \"!html\">\n\t\t\t\t[[outputConsole]]\n\t\t\t</span>\n\t\t\t<span class = \"contents\" cv-if = \"html\">\n\t\t\t\t[[htmlFrame]]\n\t\t\t</span>\n\t\t</div>\n\n\t\t<div data-section-right data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n\t\t<div data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event);\"></div>\n\n\t\t<div class = \"rows inset wide zfront\">\n\t\t\t<div class = \"cols tight\">\n\t\t\t\t<label class = \"pane wide\">StdErr</label>\n\t\t\t</div>\n\t\t\t[[errorConsole]]\n\t\t</div>\n\n\t\t<div data-section-right data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n\t\t<div data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event);\"></div>\n\n\t\t<div class = \"rows inset wide zfront\">\n\t\t\t<div class = \"cols tight\">\n\t\t\t\t<label class = \"pane wide\">Return</label>\n\t\t\t\t<!-- <label class = \"pane\">exit: [[exitCode]]</label> -->\n\t\t\t</div>\n\t\t\t[[returnConsole]]\n\t\t</div>\n\n\t</div>\n</div>\n\n<div data-section-right data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n<div data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event);\"></div>\n\n<div class = \"frame cols liquid inset\" data-mode-term>\n\t[[inputConsole]]\n</div>\n\n<!-- <div class = \"frame padded liquid inset scroll\">\n\t[[$output]]\n</div> -->\n<!--\n<div class = \"row inset\">\n\t<div class = \"spacer\"></div>\n\t<button cv-on = \":click(event)\">Run</button>\n</div> -->\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[status]]</div>\n\t<div class = \"label inset\">Memory Persistence: [ [[persist]] ]</div>\n</div>\n"
});

;require.register("apps/repoBrowser/folder.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"folder\">\n\t<span cv-on = \"click:expand(event, file);dblclick:select(event, file);\" tabindex=\"0\" cv-ref = \"focus::\">\n\t\t<img src = \"[[icon]]\" loading=lazy />\n\t\t<label>[[name]]</label>\n\t</span>\n\t<span cv-if = \"expanded\">\n\t\t<div class = \"sub\" cv-each = \"files:file:f\">\n\t\t\t[[file]]\n\t\t</div>\n\t</span>\n</div>\n"
});

;require.register("apps/repoBrowser/main.tmp.html", function(exports, require, module) {
module.exports = "<hr />\n\n<div class = \"row tight\">\n\n\t<button class = \"square\" title = \"new file\">\n\t\t<img src = \"/ui/new.png\" />\n\t</button>\n\n\t<button class = \"square\"  title = \"open file\">\n\t\t<img src = \"/ui/open.png\" />\n\t</button>\n\n\t<button cv-on = \"click:save(event)\" class = \"square\" title = \"save file\">\n\t\t<img src = \"/ui/save.png\" />\n\t</button>\n\n\t<button class = \"square\"  title = \"download file\">\n\t\t<img class = \"icon16\" src = \"/w98/download-16-4bit.png\" />\n\t</button>\n\n\t<button class = \"square\" title = \"upload file\">\n\t\t<img class = \"icon16\" src = \"/w98/system_restore-16-8bit.png\" />\n\t</button>\n\n\t<button class = \"square\" title = \"Github\">\n\t\t<img class = \"icon16\" src = \"/apps/github-16-2bit.png\" />\n\t</button>\n\n\t<button class = \"square\" title = \"toggle left bar\" cv-on = \"click:toggleSection('left')\">\n\t\t<img data-section-antileft class = \"icon16\" src = \"/ui/left-sidebar-expand.png\" />\n\t\t<img data-section-left class = \"icon16\" src = \"/ui/left-sidebar-collapse.png\" />\n\t</button>\n\n\t<button class = \"square\" title = \"toggle right bar\" cv-on = \"click:toggleSection('right')\">\n\t\t<img data-section-antiright class = \"icon16\" src = \"/ui/right-sidebar-expand.png\" />\n\t\t<img data-section-right class = \"icon16\" src = \"/ui/right-sidebar-collapse.png\" />\n\t</button>\n\n\t<button class = \"square\" title = \"toggle terminal\" cv-on = \"click:toggleSection('term')\">\n\t\t<img class = \"icon16\" src = \"/w98/console_prompt-16-4bit.png\" />\n\t</button>\n\n\t<button class = \"square\"  title = \"help\">\n\t\t<img class = \"icon16\" src = \"/w98/help_book_small-16-4bit.png\" />\n\t</button>\n\n\t<div class = \"row tight wide right\">\n\t\t<div class = \"row wide\">\n\t\t</div>\n\n\t\t<div class = \"inset wide row lower tight outer white\" tabindex = \"-1\">\n\n\t\t\t<button class = \"flat tight white\" class = \"tight\">\n\t\t\t\t<img src = \"/w98/network_drive-16-4bit.png\" />\n\t\t\t</button>\n\n\t\t\t<input\n\t\t\t\tclass = \"inset wide flat tight white\"\n\t\t\t\tvalue = \"Repo: [[repoName]] [ [[branch]] ]\"\n\t\t\t\treadonly = \"true\"\n\t\t\t/>\n\n\t\t\t<button class = \"dropdown tight\"  title = \"help\">\n\t\t\t\t<img src = \"/ui/dropdown-arrow.png\" />\n\t\t\t</button>\n\n\t\t\t<div class = \"pane repos-dropdown\">\n\t\t\t\t<div cv-if = \"!repos\" class = \"tight row\">\n\t\t\t\t\t<label class = \"pane wide\">Log into github to view your repos.</label>\n\t\t\t\t\t<button data-tint = \"red\" cv-on = \"click:githubLogin(event)\">\n\t\t\t\t\t\tGo\n\t\t\t\t\t</button>\n\t\t\t\t</div>\n\t\t\t\t<div class = \"scroll inset white\" data-role = \"icon-list\" cv-each = \"repoIcons:icon:i\">\n\t\t\t\t\t[[icon]]\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n</div>\n\n<hr />\n\n<div class = \"frame cols liquid\">\n\n\t<div data-section-left class = \"rows tight\" style = \"min-width: 200px;\">\n\t\t<div class = \"row tight tabs\">\n\n\t\t\t<div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/network_drive-16-4bit.png\" title = \"repo root\" />\n\t\t\t</div>\n\n\t\t\t<!-- <div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/notepad-16-4bit.png\" title = \"view readme\" />\n\t\t\t</div>\n\n\t\t\t<div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/world_network_directories-16-4bit.png\"  title = \"branches\" />\n\t\t\t</div>\n\n\t\t\t<div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/search_directory-16-8bit.png\"  title = \"search\" />\n\t\t\t</div>\n\n\t\t\t<div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/directory_program_group_small-16-4bit.png\"  title = \"actions\" />\n\t\t\t</div> -->\n\t\t</div>\n\n\t\t<div class = \"inset liquid white\">\n\t\t\t<div cv-each = \"files:file:f\" class = \"scroll treeview wide\">\n\t\t\t\t<div class = \"\">[[file]]</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div data-section-left data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n\n\t<div data-center-col class = \"content rows\">\n\n\t\t<div class = \"row\">\n\t\t\t<div class = \"cols wide\">\n\t\t\t\t<div class = \"row inset lower wide white tight\">\n\n\t\t\t\t\t<button cv-on = \"click:selectParent(event);\" class = \"flat tight white\">\n\t\t\t\t\t\t<img src = \"/ui/dir-up.png\" />\n\t\t\t\t\t</button>\n\n\t\t\t\t\t<input\n\t\t\t\t\t\ttype  = \"text\"\n\t\t\t\t\t\tclass = \"inset white wide flat tight\"\n\t\t\t\t\t\tvalue = \"File: [[filename]]\"\n\t\t\t\t\t\treadonly = \"true\"\n\t\t\t\t\t/>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t\t<div class = \"row tight [[viewRaw]]\">\n\t\t\t\t<div class = \"row tight tabs\">\n\t\t\t\t\t<div class = \"tab\" tabindex=\"0\" cv-on = \"click:viewControl('rendered')\">\n\t\t\t\t\t\t<img class = \"icon16\" src = \"/w98/xml_gear-16-8bit.png\" />\n\t\t\t\t\t</div>\n\t\t\t\t\t<span class = \"content\" cv-if = \"hasSource\">\n\t\t\t\t\t\t<div class = \"tab\" tabindex=\"0\"  cv-on = \"click:viewControl('plain')\">\n\t\t\t\t\t\t\t<img class = \"icon16\" src = \"/w98/file_lines-16-4bit.png\" />\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<div data-control-sector class = \"white inset scroll\">\n\t\t\t<div class = \"liquid abs-holder [[viewRaw]]\">\n\t\t\t\t<div class = \"abs-fill plain\">\n\t\t\t\t\t[[plain]]\n\t\t\t\t</div>\n\t\t\t\t<div class = \"abs-fill control\">\n\t\t\t\t\t[[control]]\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\n\t\t<div data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event);\"></div>\n\n\t\t<div data-terminal-sector class = \"liquid inset term\" style = \"min-height: 5em;\">\n\t\t\t<div class = \"terminal black liquid abs-holder\" cv-ref = \"termscroll::\">\n\t\t\t\t<div class = \"abs-fill\" data-readonly>\n\t\t\t\t\t[[terminal]]\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\n\t<div data-section-right data-vertical-resize cv-on = \"mousedown:verticalResizeGrabbed(event)\"></div>\n\n\t<div data-section-right class = \"rows tight\">\n\t\t<div class = \"row tight right tabs\">\n\n\t\t\t<div class = \"tab\" tabindex=\"0\">\n\t\t\t\t<img class = \"icon16\" src = \"/w98/history-16-4bit.png\"  title = \"history\" />\n\t\t\t</div>\n\n\t\t</div>\n\n\t\t<div data-terminal-sector class = \"liquid inset\">\n\t\t\tFile history goes here.\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[filename]]&nbsp;</div>\n\t<div class = \"label inset\" cv-if = \"chars\">type: [[filetype]] size: [[chars]]</div>\n</div>\n"
});

;require.register("apps/smim/about.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"rows frame\">\n\t<div class = \"row margin\">\n\t\t<img class = \"margin\" src = \"/sm/player-48-24bit.png\" />\n\t\t<h1>SMIM</h1>\n\t</div>\n\t<div class = \"inset liquid\">\n\t\t<div class = \"scroll margin white\">\n\t\t\t<p>&copy; 2021 Sean Morris</p>\n\t\t\t<p>--</p>\n\t\t\t<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi nec sem leo. Nulla imperdiet felis in arcu lobortis consequat. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Nunc porta feugiat risus, blandit mattis lacus scelerisque a. Donec consequat blandit erat ut semper. Donec bibendum auctor imperdiet. Duis ac eleifend leo. Nam bibendum dapibus metus ac suscipit.</p>\n\n\t\t\t<p>Nulla tempus hendrerit libero vel maximus. Ut placerat auctor orci nec elementum. Nunc convallis erat enim, quis ultricies nibh consectetur a. Suspendisse ut consectetur tellus. Nunc sit amet erat vel nunc vestibulum dignissim rutrum ut lectus. Suspendisse dictum mauris ac risus elementum, et interdum metus laoreet. Phasellus a pellentesque mauris, ut cursus elit. Mauris at lorem ut lacus fermentum iaculis vitae nec eros. Duis sed lacus auctor tellus convallis finibus non eget orci. Donec nec scelerisque nisl. Donec consequat libero a ligula dapibus, eget tincidunt mi scelerisque. Etiam malesuada maximus velit eleifend condimentum. Duis sapien dui, pulvinar in ex ut, varius sollicitudin urna.</p>\n\n\t\t\t<p>Quisque feugiat nibh elit, id convallis lectus dignissim ut. Mauris interdum odio maximus, interdum augue ut, varius mi. Integer a hendrerit dui, non auctor nisi. Mauris vel ornare tortor. Suspendisse tempus ligula tempor mi congue consequat pharetra a risus. Cras cursus at lacus nec ornare. Suspendisse eu faucibus augue. Donec interdum lacus ac ex sodales consectetur non vel diam. Praesent vulputate pretium convallis. Vestibulum egestas feugiat nibh nec semper. Praesent rutrum ut sem id viverra. Vestibulum ullamcorper nibh elit, et blandit urna faucibus id. Nulla et nisi sit amet erat dignissim blandit vitae eu quam. Ut scelerisque tempus turpis, et sodales metus. Nulla sagittis nulla et tristique blandit. Morbi non iaculis quam.</p>\n\n\t\t\t<p>Donec turpis purus, porta et cursus ultricies, egestas in tellus. Sed pretium, mi quis ultrices tristique, turpis sem mattis nisl, at suscipit ligula nunc vitae lectus. Phasellus vehicula ex sit amet massa efficitur vulputate. Nunc euismod sapien at augue pellentesque accumsan. Maecenas porttitor commodo hendrerit. Aenean luctus mauris et magna sagittis, sit amet malesuada nunc malesuada. Sed non urna leo. Nulla malesuada nisl id velit hendrerit auctor. Cras mattis aliquet hendrerit. In sollicitudin nunc ac facilisis molestie. Suspendisse potenti. Vivamus turpis lorem, vehicula a est et, porttitor congue tellus.</p>\n\n\t\t\t<p>Sed vitae nisi sed erat dignissim elementum. Integer vitae enim a ante aliquam fringilla. In enim sapien, iaculis ac ante vitae, placerat hendrerit nisi. Morbi faucibus dui a tristique interdum. Maecenas vitae augue sagittis, maximus sem sed, malesuada turpis. Cras vitae nibh justo. Suspendisse convallis pretium orci, in aliquam ante cursus et. Fusce dictum efficitur mauris sit amet pretium. Praesent eu sem gravida, euismod neque et, metus.</p>\n\t\t</div>\n\t</div>\n\t<div class = \"row margin centered\">\n\t\t<button class = \"margin\" cv-on = \"click:close();\">ok</button>\n\t</div>\n</div>\n"
});

;require.register("apps/smim/friends-list.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"smim-friends-list frame liquid\">[[gridList]]</div>\n<div class = \"row margin\">\n\t<button cv-on = \"click:handleMsgClicked;mousedown:handleButtonMouseDown\" class = \"flexible\">msg</button>\n\t<button cv-on = \"click:handleInfoClicked;mousedown:handleButtonMouseDown\" class = \"flexible\">chat</button>\n\t<button cv-on = \"click:handleInfoClicked;mousedown:handleButtonMouseDown\" class = \"flexible\">away</button>\n\t<button cv-on = \"click:handleInfoClicked;mousedown:handleButtonMouseDown\" class = \"flexible\">info</button>\n\t<button cv-on = \"click:handleInfoClicked;mousedown:handleButtonMouseDown\" class = \"flexible\">settings</button>\n</div>\n"
});

;require.register("apps/smim/login.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid rows\">\n\t<div class = \"liquid selectable inset margin\">\n\t\t[[melting]]\n\t</div>\n\t<div class = \"liquid rows margin\">\n\t\t<button class = \"margin\" cv-on = \"click:login\">enter the matrix</button>\n\t\t<span class = \"label\">SMIM v0.0.0 &copy; 2012 Sean Morris</span>\n\t</div>\n</div>\n"
});

;require.register("apps/smim/main.tmp.html", function(exports, require, module) {
module.exports = "[[main]]\n"
});

;require.register("apps/smim/message.tmp.html", function(exports, require, module) {
module.exports = "[[menuBar]]\n<div class = \"smim-message frame liquid column\">\n\t<div class = \"frame liquid cols\">\n\t\t<div class = \"liquid white inset wide rows margin\">\n\t\t\t<div class = \"message\">\n\t\t\t\t<span class = \"name\">xXxUsErNaMe420xXx:</span>\n\t\t\t\t<span class = \"message\">lorem ipsum dolor sit amet</span>\n\t\t\t</div>\n\t\t\t<div class = \"message own-message\">\n\t\t\t\t<span class = \"name\">MrCoolIce:</span>\n\t\t\t\t<span class = \"message\">lorem ipsum dolor sit amet</span>\n\t\t\t</div>\n\t\t</div>\n\t\t<div class = \"avatar\">\n\t\t\t<img src = \"/gif/200w.gif\">\n\t\t</div>\n\t</div>\n\t<div class = \"tight row\">\n\t\t<button class = \"tight square\">A</button>\n\t\t<button class = \"tight square\">A</button>\n\t\t<button class = \"tight square\">A</button>\n\t</div>\n\t<div class = \"frame liquid cols\">\n\t\t<textarea class = \"liquid white inset wide margin\"></textarea>\n\t\t<div class = \"avatar\">\n\t\t\t<img src = \"/gif/monster.gif\">\n\t\t\t<button>send</button>\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">xyz is typing... </div>\n\t<div class = \"label inset\">Last message at 12:00:00</div>\n</div>\n"
});

;require.register("apps/sonic-3000/main.tmp.html", function(exports, require, module) {
module.exports = "<iframe\n\tsrc    = \"[[src]]\"\n\tclass  = \"inset liquid\"\n\tcv-ref = \"frame::\"\n></iframe>\n"
});

;require.register("apps/taskManager/main.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"frame liquid\" cv-attr = \"data-thing\">\n<!-- \t<button cv-expand = \"cycler\" cv-on = \":click()\">cycle [[cycler.at]]</button>\n\t<span cv-attr = \"cyat:cycler.at\">[[cycler.at]]</span>\n\t<button cv-expand = \"cycler\" cv-on = \"click:recycle()\">cycle</button> -->\n\t<div class = \"liquid inset gridview scroll\">\n\t\t<table class = \"white\">\n\t\t\t<thead>\n\t\t\t\t<tr>\n\t\t\t\t\t<th cv-on = \"click:sortByColumn(event, 'id')\">id</th>\n\t\t\t\t\t<th cv-on = \"click:sortByColumn(event, 'title')\" class = \"wide\">title</th>\n\t\t\t\t\t<th cv-if = \"focusAttrs.disabled\">!</th>\n\t\t\t\t\t<th></th>\n\t\t\t\t</tr>\n\t\t\t</thead>\n\t\t\t<tbody cv-each = \"tasks:task:t\">\n\t\t\t\t<tr cv-with = \"task\" cv-carry = \"task\">\n\t\t\t\t\t<td>[[wid]]</td>\n\t\t\t\t\t<td>[[title]]</td>\n\n\t\t\t\t\t<td>\n\t\t\t\t\t\t<button cv-expand = \"focusAttrs\" cv-on = \"click:focusTask(event, task, t);\">\n\t\t\t\t\t\t\tfocus\n\t\t\t\t\t\t</button>\n\t\t\t\t\t</td>\n\n\t\t\t\t\t<td>\n\t\t\t\t\t\t<button cv-on = \"click:endTask(event, task, t);\">close</button>\n\t\t\t\t\t</td>\n\t\t\t\t</tr>\n\t\t\t</tbody>\n\t\t</table>\n\t</div>\n\n\t<div data-horizontal-resize cv-on = \"mousedown:horizontalResizeGrabbed(event)\"></div>\n\n\t<div class = \"memory-usage row\" style = \"max-height: 10em;\">\n\t\t<div class = \"current-memory inset tall\" title = \"[[usedJSHeapSize]]\">\n\t\t\t<div class = \"used\"  style = \"--height:[[heapUsedPercent]]\"></div>\n\t\t\t<span>[[usedMb]] mb used</span>\n\t\t</div>\n\t\t<div class = \"current-memory inset tall\" title = \"[[totalJSHeapSize]]\">\n\t\t\t<div class = \"total\" style = \"--height:[[heapTotalPercent]]\"></div>\n\t\t\t<span>[[totalMb]] mb total</span>\n\t\t</div>\n\t\t<div class = \"graph inset wide\">\n\t\t\t<canvas cv-ref = \"graph\"></canvas>\n\t\t\t<div class = \"marker\">[[jsHeapSizeLimit]] b</div>\n\t\t\t<div class = \"marker\">0 b</div>\n\t\t</div>\n\t</div>\n</div>\n\n<div class = \"status row\">\n\t<div class = \"label inset\">[[tasksCount]] tasks</div>\n\t<div class = \"label inset\">[[cores]] cores</div>\n</div>\n\n"
});

;require.register("apps/widgetViewer/widgetViewer.tmp.html", function(exports, require, module) {
module.exports = "<div cv-on = \"mousedown:grabTitleBar(event);\" class = \"widget-viewer\">\n\t[[widget]]\n</div>\n"
});

;require.register("control/grid-card.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"grid-list\" style = \"--columns:[[columns]]\">\n\n\t<div class = \"header\" cv-each = \"headers:header:h\">\n\t\t<span class = \"property grid-cell-[[h]]\">[[header]]</span>\n\t</div>\n\n\t<div class = \"contents\" cv-each = \"rows:row\">\n\t\t[[row]]\n\t</div>\n\n</div>\n"
});

;require.register("control/grid-list.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"inset liquid\">\n\t<div class = \"scroll wide rows\" cv-ref = \"scroller\">\n\t\t<span class = \"contents\" cv-each = \"cards:card\">\n\t\t\t[[card]]\n\t\t</span>\n\t</div>\n</div>\n"
});

;require.register("control/grid-row.tmp.html", function(exports, require, module) {
module.exports = "<label cv-each = \"cells:cell:c\">\n\t<span tabindex=\"1\" class = \"property grid-cell-[[c]]\">[[cell]]</span>\n</label>\n"
});

;require.register("control/html-frame.tmp.html", function(exports, require, module) {
module.exports = "<iframe\n\tcv-ref = \"result\"\n\tcv-on  = \"load:frameLoaded(event)\"\n\tsrcdoc = '\n<meta http-equiv=\"Content-Security-Policy\" content=\"default-src [[origin]]/curvature.js ws://[[hostname]]:9485\n[[origin]]/vendor.js &apos;unsafe-inline&apos; connect-src: &apos;self&apos; img-src: &apos;self&apos; data:;\">\n<style>\n\tiframe {\n\t\tposition: absolute;\n\t\ttop: 0px;\n\t\tleft: 0px;\n\t\twidth: 100%;\n\t\theight: 100%;\n\t\tborder: none;\n\t\tbackground-color: white;\n\t}\n</style>\n<iframe\n\tsandbox = \"allow-scripts\"\n\tsrc     = \"about:blank\"\n\tsrcdoc  = \"[[frameSource|escapeQuotes]]\"\n></iframe>\n'></iframe>\n"
});

;require.register("control/html.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"html-control main-content\">\n\t<iframe class = \"inset white\"></iframe>\n</div>\n"
});

;require.register("control/icons.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"icon-control main-area white\" data-role=\"icon-list\" cv-each = \"icons:icon:i\">[[icon]]</div>\n"
});

;require.register("control/image.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"image-control main-content\">\n\t<img class = \"inset white padded scroll\" cv-attr = \"src:src\" />\n</div>\n\n"
});

;require.register("control/json.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"json-view [[topLevel]]\"> <span cv-on = \"click:expand(event)\"><u cv-if = \"topLevel\">&nbsp;</u> [[expandIcon]]</span> [[openBracket]]\n\t<div class = \"[[expanded]]\">\n\t\t<div class = \"json-view-body\" cv-each = \"json:value:key\">\n\t\t\t<div data-type = [[value|type]]>\n\t\t\t\t<span class =\"json-key\" cv-on = \"click:expand(event, key)\">\n\t\t\t\t\t<span>[[key]]</span>\n\t\t\t\t</span>\n\t\t\t\t:\n\t\t\t\t<span class =\"json-value\" >\n\t\t\t\t\t<span>\n\t\t\t\t\t\t[[value]]\n\t\t\t\t\t</span>\n\t\t\t\t</span>\n\t\t\t\t<span class = \"edit-toggler\" cv-on = \"click:toggleEdit(event,$subview,key)\">\n\t\t\t\t\t<span cv-if = \"editing\">\n\t\t\t\t\t\tclose\n\t\t\t\t\t</span>\n\t\t\t\t\t<span cv-if = \"!editing\">\n\t\t\t\t\t\tedit\n\t\t\t\t\t</span>\n\t\t\t\t</span>\n\t\t\t\t<span cv-if = \"editing\" class = \"row\">\n\t\t\t\t\t<input class = \"wide\" cv-bind = \"value\" />\n\t\t\t\t</span>\n\t\t\t</div>\n\t\t</div>\n\t</div>\n\t[[closeBracket]]\n</div>\n"
});

;require.register("control/markdown.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"padded\">[[rendered]]</div>\n"
});

;require.register("control/plaintext.tmp.html", function(exports, require, module) {
module.exports = "<textarea cv-ref = \"code\" class = \"plaintext-control white main-content\" cv-bind = \"content\"></textarea>\n"
});

;require.register("desktop/desktop.tmp.html", function(exports, require, module) {
module.exports = "<div\n\tstyle    = \"--bg: url([[bg]])\"\n\ttabindex = \"-1\"\n\tclass    = \"desktop\"\n\tcv-on    = \"focus(event);contextmenu(event);drop(event);dragover(event)\"\n>\n\t<div data-role = \"icon-list\" cv-each = \"icons:icon:i\">\n\t\t[[icon]]\n\t</div>\n\t<div data-role = \"icon-list\" cv-each = \"endIcons:icon:i\">\n\t\t[[icon]]\n\t</div>\n</div>\n\n[[contextMenu]]\n"
});

;require.register("home/home.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"viewport\">\n\t<div data-role = \"window-host\" cv-each = \"windows:window:w\">\n\t\t[[window]]\n\t</div>\n\t[[desktop]]\n</div>\n\n[[taskBar]]\n\n<div\n\tclass  = \"shiny-outline [[hideOutline]]\"\n\tcv-ref = \"shinyOutline\"\n\tstyle  = \"top:[[outlineTop]];left:[[outlineLeft]];width:[[outlineWidth]];height:[[outlineHeight]];\"\n></div>\n<!-- <ul class = \"task-list\" cv-each = \"tasks:task:t\">\n\t<li>[[task.x]]x[[task.y]]x[[task.z]] [[task.title]]</li>\n</ul>\n -->\n"
});

;require.register("icon/icon.tmp.html", function(exports, require, module) {
module.exports = "<div cv-attr = \"draggable\" class = \"[[blinking]] [[flashing]]\" cv-on = \"click:blink(event);:dblclick(event):c;\" tabindex=\"0\" cv-ref = \"icon\">\n\t<img cv-attr = \"src:src\" draggable=\"false\" />\n\t<label>[[name]]</label>\n</div>\n"
});

;require.register("menu/menu.tmp.html", function(exports, require, module) {
module.exports = "<ul\n\tclass    = \"menu pane [[classes|join]]\"\n\ttabindex = \"0\"\n\tcv-ref   = \"menu::\"\n\tcv-each  = \"items:item\"\n>\n\t<li tabindex = \"0\" cv-on = \"click:call(event, item);\" cv-with = \"item\">\n\t\t<span cv-if = \"icon\"><img cv-attr = \"src:icon\" /></span>\n\t\t[[name]]\n\t\t[[menu]]\n\t\t<span class = \"expand\" cv-if = \"menu\">\n\t\t\t<img src = \"/arrow-expand.png\" />\n\t\t</span>\n\t</li>\n</ul>\n\n<!-- <li tabindex = \"0\">\n\tBaz\n\t<ul class = \"menu pane\">\n\t\t<li tabindex = \"0\">Foo</li>\n\t\t<li tabindex = \"0\">Bar</li>\n\t\t<li tabindex = \"0\">Baz</li>\n\t</ul>\n</li> -->\n"
});

;require.register("task/taskBar.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"task-bar pane\">\n<div class = \"start button\">\n\t\t<button>\n\t\t\t<img class = \"icon24\" src = \"/sm/player-24-24bit.png\" />\n\t\t\t<div>Start</div>\n\t\t</button>\n\t\t<div class = \"pane\">\n\t\t\t<div class = \"brand-stripe\">\n\t\t\t\t<img src = \"/nynex95-logo.svg\">\n\t\t\t</div>\n\t\t\t<ul>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/20-32-4bit.png\" />\n\t\t\t\t\tApplications\n\t\t\t\t\t<img class = \"expand\" src = \"/arrow-expand.png\" />\n\t\t\t\t\t[[programMenu]]\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/21-32-4bit.png\" />\n\t\t\t\t\tDocuments\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/22-32-4bit.png\" />\n\t\t\t\t\tSettings\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/23-32-4bit.png\" />\n\t\t\t\t\tFind\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/24-32-4bit.png\" />\n\t\t\t\t\tHelp\n\t\t\t\t</li>\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/25-32-4bit.png\" />\n\t\t\t\t\tRun...\n\t\t\t\t</li>\n\t\t\t\t<hr />\n\n\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t<img src = \"/w95/28-32-4bit.png\" />\n\t\t\t\t\tShutdown...\n\t\t\t\t</li>\n\t\t\t</ul>\n\t\t</div>\n\t</div>\n\n\t<div class = \"quickstart\">\n\t</div>\n\n\t<div class = \"task-list wide\" data-count = \"[[taskCount]]\" cv-each = \"tasks:task:t\">\n\t\t<button cv-on = \"click:activate(event,task);dblclick:doubleTap(event,task);cvDomAttached:attachTask(event,task)\">\n\t\t\t<img class = \"icon16\" cv-attr = \"src:task.icon\" />\n\t\t\t[[task.title]]\n\t\t</button>\n\t</div>\n\n\t<div class = \"tray inset\">\n\t\t<div data-role=\"icon-list\" class = \"tray tight\" cv-each = \"tray:trayItem:t\">\n\t\t\t[[trayItem]]\n\t\t</div>\n\t\t[[hh]]:[[mm]]:[[ss]]\n\t</div>\n</div>\n"
});

;require.register("ui/circle.tmp.svg", function(exports, require, module) {
module.exports = "<svg viewBox=\"0 0 100 100\" cv-ref = \"svg\">\n\t<ellipse\n\t\tstyle=\"\n\t\t\tstroke-width: 5; \n\t\t\tfill:         none;\n\t\t\tstroke:       #[[color]];\n\t\t\"\n\t\tstroke-dasharray = \"314px\"\n\t\tcx               = \"50\"\n\t\tcy               = \"50\"\n\t\trx               = \"47.5\"\n\t\try               = \"47.5\"\n\t>\n\t\t<animateTransform\n\t\t\tattributeName = \"transform\"\n\t\t\tattributeType = \"XML\"\n\t\t\ttype          = \"rotate\"\n\t\t\tfrom          = \"0   50 50\"\n\t\t\tto            = \"360 50 50\"\n\t\t\tdur           = \"[[speed]]s\"\n\t\t\trepeatCount   = \"[[repeatCount]]\"\n\t\t/>\n\t\t<animate\n\t\t\tattributeName = \"stroke-dashoffset\"\n\t\t\tattributeType = \"XML\"\n\t\t\tfrom          = \"0px\"\n\t\t\tto            = \"628px\"\n\t\t\tdur           = \"[[halfSpeed]]s\"\n\t\t\trepeatCount   = \"[[repeatCount]]\"\n\t\t/>\n\t</ellipse>\n</svg>\n"
});

;require.register("widgets/diskette/diskette.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"diskette\">\n\t<div class = \"shadow\">\n\t\t<div class = \"disk\"></div>\n\t\t<div class = \"slider\"></div>\n\t</div>\n\t<div class = \"disk\"></div>\n\t<div class = \"label\"></div>\n\t<div class = \"face\"></div>\n\t<div class = \"eye-glow\"></div>\n\t<div class = \"glass-flash\"></div>\n\t<div class = \"slider\"></div>\n\n\t<div class = \"sparks\">\n\t\t<div class = \"spark\"></div>\n\t\t<div class = \"spark\"></div>\n\t\t<div class = \"spark\"></div>\n\t\t<div class = \"spark\"></div>\n\t</div>\n</div>\n"
});

;require.register("window/menuBar.tmp.html", function(exports, require, module) {
module.exports = "<div cv-on = \"blur:menuBlur(event):c;focus:menuFocus(event):c\">\n\n\t<div class = \"menu-bar\" cv-each = \"menus:menu:m\" class = \"row\">\n\t\t<div tabindex = \"0\">\n\t\t\t[[m]]\n\t\t\t<ul class = \"menu pane\" cv-each = \"menu:menuItem:mI\">\n\t\t\t\t<li cv-on = \"click:run(event, menuItem, mI);\" tabindex = \"0\">[[mI]]</li>\n\t\t\t</ul>\n\t\t</div>\n\t\t<hr />\n\t</div>\n\n\t<!-- <div tabindex = \"0\">\n\n\t\t<u>F</u>ile\n\n\t\t<ul class = \"pane\">\n\n\t\t\t<li tabindex = \"0\">\n\t\t\t\t<u>N</u>ew\n\t\t\t</li>\n\n\t\t\t<li tabindex = \"0\">\n\t\t\t\t<u>O</u>pen\n\t\t\t</li>\n\n\t\t\t<li tabindex = \"0\">\n\t\t\t\tOpen <u>R</u>ecent\n\n\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t<li tabindex = \"0\">Foo</li>\n\t\t\t\t\t<li tabindex = \"0\">Bar</li>\n\t\t\t\t\t<li tabindex = \"0\">Baz</li>\n\t\t\t\t</ul>\n\n\t\t\t</li>\n\n\t\t\t<hr />\n\n\t\t\t<li tabindex = \"0\">\n\t\t\t\t<u>P</u>lugins\n\n\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\tFoo\n\t\t\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t\t\t<li tabindex = \"0\">Settings</li>\n\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t<li tabindex = \"0\">Start</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Stop</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Restart</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\tBar\n\t\t\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t\t\t<li tabindex = \"0\">Settings</li>\n\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t<li tabindex = \"0\">Start</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Stop</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Restart</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</li>\n\t\t\t\t\t<li tabindex = \"0\">\n\t\t\t\t\t\tBaz\n\t\t\t\t\t\t<ul class = \"pane\">\n\t\t\t\t\t\t\t<li tabindex = \"0\">Settings</li>\n\t\t\t\t\t\t\t<hr />\n\t\t\t\t\t\t\t<li tabindex = \"0\">Start</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Stop</li>\n\t\t\t\t\t\t\t<li tabindex = \"0\">Restart</li>\n\t\t\t\t\t\t</ul>\n\t\t\t\t\t</li>\n\t\t\t\t</ul>\n\n\t\t\t</li>\n\n\t\t\t<hr />\n\n\t\t\t<li tabindex = \"0\">Save</li>\n\t\t\t<li tabindex = \"0\">Save As</li>\n\n\t\t\t<hr />\n\n\t\t\t<li tabindex = \"0\">Close</li>\n\t\t\t<li tabindex = \"0\">Quit</li>\n\n\t\t</ul>\n\n\t</div> -->\n\n\t<!-- <div tabindex = \"0\">\n\n\t\t<u>E</u>dit\n\n\t\t <ul class = \"pane\">\n\t\t\t<li tabindex = \"0\">Undo</li>\n\t\t\t<li tabindex = \"0\">Redo</li>\n\t\t\t<hr />\n\t\t\t<li tabindex = \"0\">Cut</li>\n\t\t\t<li tabindex = \"0\">Copy</li>\n\t\t\t<li tabindex = \"0\">Paste</li>\n\t\t\t<li tabindex = \"0\">Delete</li>\n\t\t\t<hr />\n\t\t\t<li tabindex = \"0\">Find</li>\n\t\t\t<li tabindex = \"0\">Replace</li>\n\t\t</ul>\n\n\t</div> -->\n\n\t<!-- <div tabindex = \"0\">\n\t\t<u>V</u>iew\n\t</div>\n\n\t<div tabindex = \"0\">\n\t\t<u>G</u>o\n\t</div>\n\n\t<div tabindex = \"0\">\n\t\tF<u>a</u>vorites\n\t</div>\n\n\t<div tabindex = \"0\">\n\t\t<u>H</u>elp\n\t</div> -->\n</div>\n"
});

;require.register("window/titleBar.tmp.html", function(exports, require, module) {
module.exports = "<div class = \"title-bar\" cv-on = \"mousedown:grabTitleBar(event);dblclick:doubleClickTitle(event);\">\n\t<img cv-attr = \"src:icon\" />\n\t<span class = \"title\" cv-bind = \"title\"></span>\n\t<span>\n\t\t<button tabindex = \"-1\" class = \"minimize\" cv-on = \"click:minimize(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"restore\" cv-on = \"click:restore(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"maximize\" cv-on = \"click:maximize(event)\"></button>\n\t\t<button tabindex = \"-1\" class = \"close\" cv-on = \"click:close(event)\"></button>\n\t</span>\n</div>\n"
});

;require.register("window/window.tmp.html", function(exports, require, module) {
module.exports = "<div\n\ttabindex = \"-1\"\n\tclass    = \"window [[classes|join]]\"\n\tcv-on    = \"mousedown:focus(event):c;touchstart:focus(event):c\"\n\tcv-ref   = \"window::\">\n\t[[titleBar]]\n\t[[menuBar]]\n\t<div class = \"frame liquid\">\n\t\t[[$$template]]\n\t</div>\n</div>\n\n"
});

;require.register("___globals___", function(exports, require, module) {
  
});})();require('___globals___');


//# sourceMappingURL=templates.js.map