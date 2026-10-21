'use strict';
// Trade card links draw their keyboard ring on ::after. An absent ring still fails.
function visibleOutline(style){return !!style&&style.outline!=='none'&&parseFloat(style.width)>0&&!!style.color&&style.color!=='transparent'&&!/rgba\([^)]*,\s*0(?:\.0+)?\)$/.test(style.color);}
function hasVisibleFocus(value){return !!value?.focusVisible&&value.rect?.width>0&&value.rect?.height>0&&(visibleOutline(value.own)||(value.after?.content!=='none'&&parseFloat(value.after?.height)>0&&parseFloat(value.after?.areaWidth)>0&&visibleOutline(value.after)));}
module.exports={hasVisibleFocus};
