(function(){function e(a,b){this.stack.push(a);this.indices.push(b)}function f(a){this.stack.pop();this.indices.pop();this.setCurrentIndex(this.getCurrentIndex()+a)}function g(a){var b,c,h=this.getCurrent(),i=this.getCurrentIndex(),j=a>0;if(h){c=j?h.length-1:0;for(;j?i<=c:i>=c;i+=a){b=h[i];this.setCurrentIndex(i);if(d(b))break}if(j?i>c:i<c){f.call(this,a);g.call(this,a)}else e.call(this,b,j?0:b.length-1)}return this}function h(a,b){var c;a=typeof a=="string"?new RegExp(a):a;do{g.call(this,b);c=this.getCurrent()}while(c&&!a.test(c.name))}var a=infuse("proteus"),b=infuse("util"),c=a.Class,d=b.isArray;module.exports=c.derive({init:function(b,c){this.setSubject(b);this.options=a.merge({},this.options,c||{});this.start()},options:{},start:function(){this.reset();e.call(this,this.subject,0)},next:function(){g.call(this,1);return this},rewind:function(){g.call(this,-1);return this},skipTo:function(a){h.call(this,a,1);return this},rewindTo:function(a){h.call(this,a,-1);return this},getParent:function(a){var b=this.stack,c=b.length;while(c--)if(b[c]===a){c--;break}return b[c]},hasTerminated:function(){return!this.stack||!this.stack.length},getCurrent:function(){var a=this.stack,b=a[a.length-1];b&&!b.name&&typeof b[0]=="string"&&(b.name=b[0]);return b},getCurrentIndex:function(){var a=this.indices;return a[a.length-1]},setCurrentIndex:function(a){var b=this.indices;b[b.length-1]=a;return this},setSubject:function(a){this.subject=a;this.reset();return this},getSubject:function(){return this.subject},reset:function(){(this.stack||(this.stack=[])).length=0;(this.indices||(this.indices=[])).length=0;return this}})})(module.exports)