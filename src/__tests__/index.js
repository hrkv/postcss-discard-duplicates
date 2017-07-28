import ava from 'ava';
import postcss from 'postcss';
import {name} from '../../package.json';
import plugin from '..';

const tests = [{
    message: 'should remove duplicate rules',
    fixture: 'h1{font-weight:bold}h1{font-weight:bold}',
    expected: 'h1{font-weight:bold}',
}, {
    message: 'should remove duplicate rules (2)',
    fixture: 'h1{color:#000}h2{color:#fff}h1{color:#000}',
    expected: 'h2{color:#fff}h1{color:#000}',
}, {
    message: 'should remove duplicate rules (3)',
    fixture: 'h1 { font-weight: bold }\nh1{font-weight:bold}',
    expected: 'h1{font-weight:bold}',
}, {
    message: 'should remove duplicate declarations',
    fixture: 'h1{font-weight:bold;font-weight:bold}',
    expected: 'h1{font-weight:bold}',
}, {
    message: 'should remove duplicate declarations, with comments',
    fixture: 'h1{/*test*/font-weight:bold}h1{/*test*/font-weight:bold}',
    expected: 'h1{/*test*/font-weight:bold}',
}, {
    message: 'should remove duplicate @rules',
    fixture: '@charset "utf-8";@charset "utf-8";',
    expected: '@charset "utf-8";',
}, {
    message: 'should remove duplicate @rules (2)',
    fixture: '@charset "utf-8";@charset "hello!";@charset "utf-8";',
    expected: '@charset "hello!";@charset "utf-8";',
}, {
    message: 'should remove duplicates inside @media queries',
    fixture: '@media print{h1{display:block}h1{display:block}}',
    expected: '@media print{h1{display:block}}',
}, {
    message: 'should remove duplicate @media queries',
    fixture: '@media print{h1{display:block}}@media print{h1{display:block}}',
    expected: '@media print{h1{display:block}}',
}, {
    message: 'should not mangle same keyframe rules but with different vendors',
    fixture: '@-webkit-keyframes flash{0%,50%,100%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,50%,100%{opacity:1}25%,75%{opacity:0}}',
    expected: '@-webkit-keyframes flash{0%,50%,100%{opacity:1}25%,75%{opacity:0}}@keyframes flash{0%,50%,100%{opacity:1}25%,75%{opacity:0}}',
}, {
    message: 'should not merge across keyframes',
    fixture: '@-webkit-keyframes test{0%{color:#000}to{color:#fff}}@keyframes test{0%{color:#000}to{color:#fff}}',
    expected: '@-webkit-keyframes test{0%{color:#000}to{color:#fff}}@keyframes test{0%{color:#000}to{color:#fff}}',
}, {
    message: 'should not merge across keyframes (2)',
    fixture: '@-webkit-keyframes slideInDown{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%);visibility:visible}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes slideInDown{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%);visibility:visible}to{-webkit-transform:translateY(0);transform:translateY(0)}}',
    expected: '@-webkit-keyframes slideInDown{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%);visibility:visible}to{-webkit-transform:translateY(0);transform:translateY(0)}}@keyframes slideInDown{0%{-webkit-transform:translateY(-100%);transform:translateY(-100%);visibility:visible}to{-webkit-transform:translateY(0);transform:translateY(0)}}',
}, {
    message: 'should remove declarations before rules',
    fixture: 'h1{font-weight:bold;font-weight:bold}h1{font-weight:bold}',
    expected: 'h1{font-weight:bold}',
}, {
    message: 'should not deduplicate comments',
    fixture: 'h1{color:#000}/*test*/h2{color:#fff}/*test*/',
    expected: 'h1{color:#000}/*test*/h2{color:#fff}/*test*/',
}, {
    message: 'should not remove declarations when selectors are different',
    fixture: 'h1{font-weight:bold}h2{font-weight:bold}',
    expected: 'h1{font-weight:bold}h2{font-weight:bold}',
}, {
    message: 'should not remove across contexts',
    fixture: 'h1{display:block}@media print{h1{display:block}}',
    expected: 'h1{display:block}@media print{h1{display:block}}',
}, {
    message: 'should not be responsible for normalising selectors',
    fixture: 'h1,h2{font-weight:bold}h2,h1{font-weight:bold}',
    expected: 'h1,h2{font-weight:bold}h2,h1{font-weight:bold}',
}, {
    message: 'should not be responsible for normalising declarations',
    fixture: 'h1{margin:10px 0 10px 0;margin:10px 0}',
    expected: 'h1{margin:10px 0 10px 0;margin:10px 0}',
}, {
    message: 'should remove duplicate rules and declarations',
    fixture: 'h1{color:#000}h2{color:#fff}h1{color:#000;color:#000}',
    expected: 'h2{color:#fff}h1{color:#000}',
}, {
    message: 'should remove differently ordered duplicates',
    fixture: 'h1{color:black;font-size:12px}h1{font-size:12px;color:black}',
    expected: 'h1{font-size:12px;color:black}',
}, {
    message: 'should remove partial duplicates',
    fixture: 'h1{color:red;background:blue}h1{color:red}',
    expected: 'h1{background:blue}h1{color:red}',
}, {
    message: 'should preserve browser hacks (1)',
    fixture: 'h1{_color:white;color:white}',
    expected: 'h1{_color:white;color:white}',
}, {
    message: 'should preserve browser hacks (2)',
    fixture: '@media \0 all {}@media all {}',
    expected: '@media \0 all {}@media all {}',
}, {
    message: 'should remove duplicate rules and declarations in reverse order',
    fixture: 'h1{color:#000}h2{color:#fff}h1{color:#000;color:#000}',
    expected: 'h1{color:#000}h2{color:#fff}',
    options: {
        reverseRemoval: true,
    },
}, {
    message: 'should remove partial duplicates in reverse order',
    fixture: 'h1{color:red;background:blue}h1{color:red}',
    expected: 'h1{color:red;background:blue}',
    options: {
        reverseRemoval: true,
    },
}];

tests.forEach(test => {
    ava(test.message, t => {
        const out = postcss(plugin(test.options || {})).process(test.fixture);
        t.deepEqual(out.css, test.expected);
    });
});

ava('should use the postcss plugin api', t => {
    t.truthy(plugin().postcssVersion, 'should be able to access version');
    t.deepEqual(plugin().postcssPlugin, name, 'should be able to access name');
});
