// 获取编辑器容器
const inputBox = document.querySelector('.ace-line[data-node="true"]');

if (inputBox) {
    // 1. 清空所有现有内容
    inputBox.innerHTML = '';

    // 2. 创建符合编辑器结构的DOM节点
    const activeSpan = document.createElement('span');
    activeSpan.setAttribute('data-string', 'true');
    activeSpan.setAttribute('data-leaf', 'true');
    activeSpan.textContent = '666'; // 输入内容

    const placeholderSpan = document.createElement('span');
    placeholderSpan.setAttribute('data-string', 'true');
    placeholderSpan.setAttribute('data-leaf', 'true');
    placeholderSpan.innerHTML = '&#8203;'; // 零宽空格符

    // 3. 插入新节点
    inputBox.appendChild(activeSpan);
    inputBox.appendChild(placeholderSpan);

    // 4. 触发输入更新
    const inputEvent = new Event('input', { bubbles: true });
    inputBox.dispatchEvent(inputEvent);
}
// 等待1000ms
setTimeout(() => {
    // 查找按钮元素
    const btn = document.querySelector('svg.webcast-chatroom___send-btn');
    // 确保按钮未被禁用
    btn.classList.remove('disable');
    btn.removeAttribute('disabled');
    // 创建并触发更真实的点击事件
    const clickEvent = new MouseEvent('click', {
        bubbles: true, // 允许事件冒泡
        cancelable: true, // 允许取消默认行为
        view: window,
        composed: true // 允许跨越 shadow DOM 边界
    });
    // 最终触发点击事件
    btn.dispatchEvent(clickEvent);
}, 100);