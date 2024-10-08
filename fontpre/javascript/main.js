const fontFile = document.getElementById('fontFile');
const fontSelect = document.getElementById('fontSelect');
const fontSize = document.getElementById('fontSize');
const testText = document.getElementById('testText');
const charMapItems = document.querySelectorAll('.char-map-item');

// 获取全部固定字号的测试文本
const sizeTestText8 = document.querySelector('.size8px');
const sizeTestText12 = document.querySelector('.size12px');
const sizeTestText16 = document.querySelector('.size16px');
const sizeTestText24 = document.querySelector('.size24px');
const sizeTestText32 = document.querySelector('.size32px');
const sizeTestText48 = document.querySelector('.size48px');
const sizeTestText64 = document.querySelector('.size64px');
const sizeTestText72 = document.querySelector('.size72px');
const sizeTestText128 = document.querySelector('.size128px');

const fontFeatures = document.getElementById('fontFeatures');
const variableAxes = document.getElementById('variableAxes');
const fontColor = document.getElementById('fontColor');
const bgColor = document.getElementById('bgColor');
const loadFontInput = document.getElementById('load-font');
const fontInfoDiv = document.getElementById('font-info');

const body = document.querySelector('body');

let customFont = null;
let customFontBuffer = null;

function changePage() {
    const contentBox = document.querySelector('#content');
    const welcomeBox = document.querySelector('#welcome');
    const headerBox = document.querySelector('header');
    contentBox.style.opacity = '1';
    welcomeBox.style.opacity = '0';
    headerBox.style.opacity = '1';
    headerBox.style.marginTop = '0';
    body.style.overflowY = 'auto'
    setTimeout(() => {
        if (welcomeBox) {
            welcomeBox.remove();
        }
    }, 150);
}

const featureDescriptions = {
    'aalt': '替代注释',
    'liga': '连字',
    'dlig': '可选连字',
    'hlig': '历史连字',
    'clig': '上下文连字',
    'smcp': '小型大写字母',
    'c2sc': '从大写字母转换的小型大写字母',
    'case': '区分大小写形式',
    'cpsp': '大写字母间距',
    'frac': '分数',
    'numr': '分子',
    'dnom': '分母',
    'tnum': '表格数字',
    'pnum': '比例数字',
    'onum': '老式数字',
    'lnum': '对齐数字',
    'ordn': '序数',
    'zero': '斜杠零',
    'sups': '上标',
    'subs': '下标',
    'sinf': '科学下标',
    'salt': '风格变体',
    'ss01': '风格集 1',
    'ss02': '风格集 2',
    'ss03': '风格集 3',
    'ss04': '风格集 4',
    'ss05': '风格集 5',
    'ss06': '风格集 6',
    'ss07': '风格集 7',
    'ss08': '风格集 8',
    'ss09': '风格集 9',
    'ss10': '风格集 10',
    'swsh': '花饰',
    'cswh': '上下文花饰',
    'titl': '标题',
    'kern': '字距调整',
    'locl': '本地化形式',
    'mkmk': '标记到标记定位',
    'mark': '标记定位',
    'rlig': '必需连字',
    'calt': '上下文变体',
    'hist': '历史形式',
    'ornm': '装饰',
    'wght': '字重',
    'wdth': '宽度',
    'ital': '斜体',
    'slnt': '倾斜',
    'opsz': '光学尺寸',
    'vert': '竖排书写',
    'Serif': '衬线',
};

fontFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        loadLocalFont(file);
        loadFontInfo(file);
        changePage();
    }
});

fontSelect.addEventListener('change', updateTextStyle);
fontSize.addEventListener('input', updateTextStyle);
fontColor.addEventListener('input', updateTextStyle);

async function loadLocalFont(file) {
    const fontName = file.name.split('.')[0];
    try {
        const arrayBuffer = await file.arrayBuffer();
        customFontBuffer = new Uint8Array(arrayBuffer);
        const fontBlob = new Blob([customFontBuffer], { type: 'font/opentype' });
        const fontUrl = URL.createObjectURL(fontBlob);

        const response = await fetch(fontUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fontData = await response.arrayBuffer();

        const fontFace = new FontFace(fontName, fontData);

        await fontFace.load();

        document.fonts.add(fontFace);

        customFont = fontName;

        const option = document.createElement('option');
        option.value = fontName;
        option.textContent = fontName;
        fontSelect.appendChild(option);
        fontSelect.value = fontName;

        await checkFontFeatures(fontName);
        updateTextStyle();
    } catch (error) {
        console.error('Error loading font:', error);
        loadedFontName.innerHTML = `<div class="errorinfo"><main class="infomain"><span class="icon"></span><h4>加载字体时出错</h4><p>请刷新页面并选择其他字体文件再试。</p><code>${error.message}</code></main></div>`;
        body.style.overflowY = "hidden"
    }
    //  finally {
    //     URL.revokeObjectURL(fontUrl);
    // }
}

async function loadFontInfo(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const font = opentype.parse(arrayBuffer);

        let info = '';

        const nameTable = font.tables.name;
        info += `<div class="info-title"><h3>${nameTable.fontFamily.en || '未知'}</h3><span>字体详细信息</span></div>`;
        info += `<code>全称: ${nameTable.fullName.en || '未知'}<br>`;
        info += `子系列名称: ${nameTable.fontSubfamily.en || '未知'}<br>`;
        info += `版本: ${nameTable.version.en || '未知'}<br>`;
        info += `版权: ${nameTable.copyright.en || '未知'}<br>`;
        info += `设计师: ${nameTable.designer.en || '未知'}<br>`;
        info += `供应商: ${nameTable.manufacturer.en || '未知'}<br>`;

        const weightClass = font.tables.os2.usWeightClass;
        let weightName;

        if (font.tables.os2) {
            // const weightClass = font.tables.os2.usWeightClass;
            // let weightName;
            switch (weightClass) {
                case 100: weightName = 'Thin'; break;
                case 200: weightName = 'Extra Light'; break;
                case 300: weightName = 'Light'; break;
                case 400: weightName = 'Regular'; break;
                case 500: weightName = 'Medium'; break;
                case 600: weightName = 'Semi Bold'; break;
                case 630: weightName = 'Bold'; break;
                case 700: weightName = 'Bold'; break;
                case 800: weightName = 'Extra Bold'; break;
                case 900: weightName = 'Black'; break;
                default: weightName = 'Unknown';
            }
        }

        if (font.tables.fvar) {
            info += '可变字体轴:<br>';
            font.tables.fvar.axes.forEach(axis => {
                info += `  - ${axis.tag}: 由 ${axis.minValue}, 至 ${axis.maxValue}, 默认为 ${axis.defaultValue}<br></code>`;
            });
        } else {
            info += `字重: ${weightClass} <div class="whgtinfo"><span class="icon"></span><p>此字体不支持可变字重。</p></div>`;
        }

        fontInfoDiv.innerHTML = info;
    } catch (error) {
        console.error('Error loading font:', error);
        fontInfoDiv.innerHTML = `<div class="whgtinfo"><span class="icon"></span><p>读取字体文件信息表时出错: ${error.message}</p></div>`;
    }
}

// loadFontInput.addEventListener('change', (e) => {
//     if (e.target.files.length > 0) {
//         loadFontInfo(e.target.files[0]);
//     }
// });

async function checkFontFeatures(fontName) {
    fontFeatures.innerHTML = '';
    variableAxes.innerHTML = '';

    const font = await opentype.load(URL.createObjectURL(new Blob([customFontBuffer])));

    const features = font.tables.gsub.features;
    if (features) {
        const featureSet = new Set();
        features.forEach(feature => {
            featureSet.add(feature.tag);
        });

        const featuretitle = document.createElement('div')
        featuretitle.className = 'feature-title';
        featuretitle.innerHTML = '<h3>可用的 OpenType 特性</h3><span>悬停复选框以查看特性名称，部分特性未知对应中文描述。</span>';
        fontFeatures.appendChild(featuretitle);

        featureSet.forEach(feature => {
            const div = document.createElement('div');
            div.className = 'feature-control';
            div.innerHTML = `
                <input type="checkbox" id="${feature}" name="${feature}" title="${featureDescriptions[feature] || feature}">
                <label for="${feature}">${featureDescriptions[feature] || feature}<span class="featureName">${feature}</span></label>
            `;
            fontFeatures.appendChild(div);

            div.querySelector('input').addEventListener('change', updateTextStyle);
        });
    }

    if (font.tables.fvar) {
        const axes = font.tables.fvar.axes;
        axes.forEach(axis => {
            const div = document.createElement('div');
            div.className = 'axis-control';

            div.innerHTML = `
                <label for="${axis.tag}" title="${featureDescriptions[axis.tag] || axis.tag}">${featureDescriptions[axis.tag] || axis.name.en || axis.tag} </label>
                <span class="axis-min">${Math.round(axis.minValue)}</span>
                <input type="range" id="${axis.tag}" name="${axis.tag}"
                       min="${axis.minValue}" max="${axis.maxValue}" 
                       value="${axis.defaultValue}" step="1"
                       title="${featureDescriptions[axis.tag] || axis.tag}">
                <span class="axis-max">${Math.round(axis.maxValue)}</span>
                <span class="axis-value">${Math.round(axis.defaultValue)}</span>
            `;
            variableAxes.appendChild(div);

            const input = div.querySelector('input');
            const span = div.querySelector('.axis-value');
            input.addEventListener('input', (e) => {
                span.textContent = Math.round(e.target.value);
                updateTextStyle();
            });
        });
    }

    // 保存字体轴信息到全局变量，以便在其他地方使用
    window.fontAxes = font.tables.fvar ? font.tables.fvar.axes : null;

    updateTextStyle(); // 初始化时调用一次
}

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
}

function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b];
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function changeColorVariable(newColor) {
    document.documentElement.style.setProperty('--text-color', newColor);
}

function change50Variable(newColor) {
    document.documentElement.style.setProperty('--text-color-50', newColor);
}

function change25Variable(newColor) {
    document.documentElement.style.setProperty('--text-color-25', newColor);
}

function change75Variable(newColor) {
    document.documentElement.style.setProperty('--text-color-75', newColor);
}

function changeSizeBGVariable(newColor) {
    document.documentElement.style.setProperty('--size-color-bg', newColor);
}

fontSize.addEventListener('keydown', (e) => {
    const allowedKeys = ['ArrowUp', 'ArrowDown'];
    if (!allowedKeys.includes(e.key)) {
        e.preventDefault();
    }
});

function updateTextStyle() {
    const selectedFont = fontSelect.value;
    const size = fontSize.value;
    const color = fontColor.value;

    let fontFeatureSettings = '';
    let fontVariationSettings = '';

    document.querySelectorAll('#fontFeatures input:checked').forEach(input => {
        fontFeatureSettings += `"${input.name}" 1, `;
    });

    document.querySelectorAll('#variableAxes input').forEach(input => {
        fontVariationSettings += `"${input.name}" ${input.value}, `;
    });

    fontFeatureSettings = fontFeatureSettings.slice(0, -2);
    fontVariationSettings = fontVariationSettings.slice(0, -2);

    const wghtInput = document.getElementById('wght');
    const opszInput = document.getElementById('opsz');
    if (wghtInput && opszInput && window.fontAxes) {
        const wghtAxis = window.fontAxes.find(axis => axis.tag === 'wght');
        const opszAxis = window.fontAxes.find(axis => axis.tag === 'opsz');

        if (wghtAxis && opszAxis) {
            const wghtValue = parseFloat(wghtInput.value);
            let opszValue = parseFloat(size);

            const wghtRange = wghtAxis.maxValue - wghtAxis.minValue;
            if (wghtValue > wghtAxis.minValue + wghtRange * 0.75) {
                opszValue *= 0.8;
            } else if (wghtValue < wghtAxis.minValue + wghtRange * 0.25) {
                opszValue *= 1.2;
            }

            // 确保 opszValue 在允许的范围内
            opszValue = Math.max(opszAxis.minValue, Math.min(opszAxis.maxValue, opszValue));

            opszInput.value = opszValue;
            opszInput.nextElementSibling.nextElementSibling.textContent = Math.round(opszValue);
            fontVariationSettings = fontVariationSettings.replace(/("opsz" )\d+(\.\d+)?/, `$1${opszValue}`);
        }
    }

    // const applyStyle = (element) => {

    //     element.style.fontFamily = selectedFont;
    //     element.style.color = color;
    //     element.style.fontFeatureSettings = fontFeatureSettings || 'normal';
    //     element.style.fontVariationSettings = fontVariationSettings || 'normal';
    // };

    testText.style.fontSize = `${size}px`;
    // applyStyle(testText);

    // charMapItems.forEach(item => {
    //     item.style.fontFamily = selectedFont;
    //     item.style.color = color;
    //     item.style.fontFeatureSettings = fontFeatureSettings || 'normal';
    //     item.style.fontVariationSettings = fontVariationSettings || 'normal';
    // });

    document.documentElement.style.setProperty('--selected-font', selectedFont);
    document.documentElement.style.setProperty('--selected-color', color);
    document.documentElement.style.setProperty('--font-feature-settings', fontFeatureSettings);
    document.documentElement.style.setProperty('--font-variation-settings', fontVariationSettings);

    // // 修改固定字号测试文本样式
    // [sizeTestText8, sizeTestText12, sizeTestText16, sizeTestText24, sizeTestText32,
    //     sizeTestText48, sizeTestText64, sizeTestText72, sizeTestText128].forEach(applyStyle);

    bgColor.addEventListener('change', function () {
        const selectedColor = this.value;
        body.style.backgroundColor = selectedColor;
        testText.style.backgroundColor = selectedColor;
        const rgbColor = hexToRgb(selectedColor);
        const luminance = getLuminance(rgbColor);

        changeSizeBGVariable(selectedColor);

        if (luminance < 0.5) {
            changeColorVariable('#ffffff');
            change75Variable('rgba(255, 255, 255, 0.75)');
            change50Variable('rgba(255, 255, 255, 0.5)');
            change25Variable('rgba(255, 255, 255, 0.25)');
        } else {
            changeColorVariable('#000000');
            change75Variable('rgba(0, 0, 0, 0.5)');
            change50Variable('rgba(0, 0, 0, 0.35)');
            change25Variable('rgba(0, 0, 0, 0.1)');
        }
    });
}

updateTextStyle();

function updateTestText(element) {
    var thisText = element.value;
    // console.log(thisText)
    sizeTestText8.textContent = thisText;
    sizeTestText12.textContent = thisText;
    sizeTestText16.textContent = thisText;
    sizeTestText24.textContent = thisText;
    sizeTestText32.textContent = thisText;
    sizeTestText48.textContent = thisText;
    sizeTestText64.textContent = thisText;
    sizeTestText72.textContent = thisText;
    sizeTestText128.textContent = thisText;
}

function syncHeights() {
    var sizeElements = document.querySelectorAll('.size');

    for (var i = 0; i < sizeElements.length; i++) {
        var sizeElement = sizeElements[i];
        var sizeTestText = sizeElement.nextElementSibling;

        if (sizeTestText && sizeTestText.id === 'sizeTestText') {
            var height = sizeTestText.offsetHeight;
            sizeElement.style.height = height + 'px';
            // console.log('Synced height for a .size element: ' + height + 'px');
        }
        //  else {
        //     console.error('No adjacent #sizeTestText found for a .size element');
        // }
    }
}

// 页面加载完成后执行同步
document.addEventListener('DOMContentLoaded', syncHeights);

function adjustMargin() {
    const fontPreview = document.getElementById('fontPreview');
    const fontPreviewTop = fontPreview.getBoundingClientRect().top;

    if (fontPreviewTop <= 128) {
        testText.style.top = '-150px';
    } else {
        testText.style.top = '44px';
    }
}

function scrollToTop() {
    // 方法1：使用 window.scrollTo
    window.scrollTo(0, 0);
}

// 在页面加载完成后调用 scrollToTop 函数和 adjustMargin 函数
window.addEventListener('load', function () {
    scrollToTop();
    adjustMargin();
});

// 在页面加载完成后和滚动时调用 adjustMargin 函数
window.addEventListener('scroll', adjustMargin);

function back() {
    var origin = window.location.origin;
    window.location.replace(origin);
}
