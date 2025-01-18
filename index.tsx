import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from 'react-native-webview';

const htmlContentTempl = `<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    body {
        margin: 0;
        padding: 0;
    }
    #editor {
        border: 0px solid #ccc;
        cursor: text;
        padding: 2px;
        outline: none;
        min-height: {{initialHeight}}px;
        box-sizing: border-box;
    }
    p {
        margin: 0;
        padding: 0;
    }
    .mention {
        color: blue;
    }
    div[contenteditable="true"]:empty:before {
        content: attr(placeholder);
        color: #555;
        opacity: 0.5;
    }

    div[contenteditable="true"]:empty:focus:before {
        content: "";
    }
    </style>
</head>

<body>
    <div id="editor" contenteditable="true" placeholder="Type something...">{{content}}</div>
</body>

<script type="text/javascript">
const editor = document.getElementById('editor');

function focusEditor() {
    editor.focus();
}

function blurEditor() {
    editor.blur();
}

function injectCss(css) {
    const style = document.createElement('style');
    style.innerHTML = css;
    document.head.appendChild(style);
}

function setHtml(html) {
    editor.innerHTML = html;
}

function insertHtml(html) {
    // Get the current selection
    const selection = window.getSelection();

   if (!selection || selection.rangeCount === 0) {
        editor.insertAdjacentHTML('beforeend', html);
        return;
    }

    // Get the range of the current selection
    const range = selection.getRangeAt(0);

    // Get the HTML to insert
    // const htmlToInsert = '<div>Hello, world!</div>';

    // Insert the HTML at the current position
    // document.execCommand('insertHTML', false, html);

    // Insert the new element at the current position
    const newParent = document.createElement('span');
    newParent.innerHTML = html;
    range.insertNode(...newParent.childNodes);
    range.collapse(); // removes selected and places caret at the end of the injected node
}

function surroundSelection(textBefore, textAfter) {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);

            var startNode = range.startContainer, startOffset = range.startOffset;
            var boundaryRange = range.cloneRange();
            var startTextNode = document.createTextNode(textBefore);
            var endTextNode = document.createTextNode(textAfter);
            boundaryRange.collapse(false);
            boundaryRange.insertNode(endTextNode);
            boundaryRange.setStart(startNode, startOffset);
            boundaryRange.collapse(true);
            boundaryRange.insertNode(startTextNode);
            
            // Reselect the original text
            range.setStartAfter(startTextNode);
            range.setEndBefore(endTextNode);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

function surroundSelectionTag(tagName) {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            var range = sel.getRangeAt(0);
            
            const newParent = document.createElement(tagName);
            range.surroundContents(newParent);

            sel.removeAllRanges();
            sel.addRange(range);
            range.collapse(); // removes selected and places caret at the end of the injected node
        }
    }
}

function toggleSelectionTag(tagName) {
    if (window.getSelection) {
        var sel = window.getSelection();
        if (sel.rangeCount > 0) {
            const range = sel.getRangeAt(0);

            const selParent = sel.anchorNode?.parentElement;
            const selectedElem = selParent?.nodeType == 1 && selParent?.children.length < 2 && selParent;
            
            // un-wrap
            if(selectedElem.tagName === tagName.toUpperCase()) {
                selectedElem.replaceWith(...selectedElem.childNodes)
            } else {
                const newParent = document.createElement(tagName);
                range.surroundContents(newParent);
            }

            sel.removeAllRanges();
            sel.addRange(range);
            range.collapse(); // removes selected and places caret at the end of the injected node
        }
    }
}

function setPlaceholder(placeholder) {
    editor.setAttribute('placeholder', placeholder);
}

// create an Observer instance
const resizeObserver = new ResizeObserver(entries => {
    //console.log('Body height changed:', entries[0].target.clientHeight, entries[0].target.scrollHeight)
    var newHeight = Math.max(entries[0].target.clientHeight, entries[0].target.scrollHeight);

    window.ReactNativeWebView.postMessage(
      JSON.stringify({
        event: 'documentHeight',
        documentHeight: newHeight,
      }),
    );
  }
)

// start observing a DOM node
resizeObserver.observe(editor);

editor.addEventListener('input', function(event) {
    // console.log('Hey, somebody changed something in my text!');

    window.ReactNativeWebView.postMessage(
        JSON.stringify({
          event: 'contentChange',
          contentChange: event.target.innerHTML,
        }),
    );
});
</script>`

// Define the RichEditorRef type
export interface RichEditorRef {
    focus: () => void;
    blur: () => void;
    setValue: (html: string | null) => void;
    insertHtml: (html: string) => void;
    surroundSelection: (before: string, after: string) => void;
    surroundSelectionTag: (tagName: string) => void;
    toggleSelectionTag: (tagName: string) => void;
    setPlaceholder: (placeholder: string) => void;
    injectCss: (css: string) => void;
}
  
interface RichEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string | undefined;
  customStyles?: any;
  bgColor?: string;
  injectedCss?: string;
  maxHeight?: number;
  initialHeight?: number;
  onLoadEnd?: any;
}

const RichEditor = forwardRef<RichEditorRef, RichEditorProps>((props, ref) => {
    // const isAndroid = Platform.OS === 'android';
    const initialHeight = props.initialHeight || 20;
    const approxiate = 2;
    let timeout: NodeJS.Timeout | undefined;

  const [loadingEnd, setLoadingEnd] = useState(false);
  const [webviewHeight, setWebviewHeight] = useState(initialHeight);
  const [htmlContent, setHtmlContent] = useState(htmlContentTempl.replace('{{content}}', props.value || '').replace('{{initialHeight}}', initialHeight.toString()));
  const [content, setContent] = useState(props.value || '');
  const webViewref = React.useRef<WebView>(null);
  
    useImperativeHandle(ref, () => ({
        focus: () => focusEditor(),
        blur: () => blurEditor(),
        setValue: (html) => setValue(html),
        insertHtml: (html) => insertHtml(html),
        surroundSelection: (before, after) => surroundSelection(before, after),
        surroundSelectionTag: (tagName) => surroundSelectionTag(tagName),
        toggleSelectionTag: (tagName) => toggleSelectionTag(tagName),
        setPlaceholder: (placeholder) => setPlaceholder(placeholder),
        injectCss: (css) => injectCss(css),
    }));

    const handleMessage = useCallback(event => {
        // iOS already inherit from the whole document body height,
        // so we don't have to manually get it with the injected script
        // if (!isAndroid) {
        //   return;
        // }

        const data = JSON.parse(event.nativeEvent.data);
        // console.log("data:", data, webviewHeight);

        if (!data) {
            return;
        }

        switch (data.event) {
            case 'documentHeight': {
                if (data.documentHeight !== 0 && (
                    data.documentHeight < webviewHeight + approxiate 
                    || data.documentHeight > webviewHeight + approxiate
                )) {
                    if (props.maxHeight !== undefined && data.documentHeight > props.maxHeight) {
                        // clearTimeout(timeout);
                        // timeout = setTimeout(() => {
                            setWebviewHeight(props.maxHeight || 100);
                        // }, 50);
                        return;
                    }

                    // clearTimeout(timeout);
                    // timeout = setTimeout(() => {
                        setWebviewHeight(data.documentHeight);
                    // }, 50);
                }
                break;
            }
            
            case 'contentChange': {
                setContent(data.contentChange)
                // props.onChange(data.contentChange)
                break;
            }
        }
    }, [webviewHeight]);

    const handleLoadEnd = () => {
        setLoadingEnd(true)
        if (props.onLoadEnd && typeof props.onLoadEnd == 'function') {
            props.onLoadEnd()
        }
    }

    useEffect(() => {
        if (props.placeholder && loadingEnd) {
            setPlaceholder(props.placeholder);
        }
    }, [props.placeholder, loadingEnd]);

    useEffect(() => {
        if (props.injectedCss && loadingEnd) {
            injectCss(props.injectedCss);
        }
    }, [props.injectedCss, loadingEnd]);

    useEffect(() => {
        if (props.onChange && content !== props.value) {
            props.onChange(content)
        }
    }, [content]);

    const injectCss = (css: string) => {
        webViewref.current?.injectJavaScript(`window.injectCss('${css}');`);
    }

    const setPlaceholder = (placeholder: string) => {
        webViewref.current?.injectJavaScript(`window.setPlaceholder('${placeholder}');`);
    }

    const focusEditor = () => {
        webViewref.current?.injectJavaScript('window.focusEditor();');
    }

    const blurEditor = () => {
        webViewref.current?.injectJavaScript('window.blurEditor();');
    }

    const setValue = (html: string | null) => {
        webViewref.current?.injectJavaScript(`window.setHtml(${JSON.stringify(html)});`);
    }

    const insertHtml = (html: string) => {
        webViewref.current?.injectJavaScript(`window.insertHtml(${JSON.stringify(html)});`);
    }

    const surroundSelection = (before: string, after: string) => {
        webViewref.current?.injectJavaScript(`window.surroundSelection('${before}', '${after}');`);
    }

    const surroundSelectionTag = (tagName: string) => {
        webViewref.current?.injectJavaScript(`window.surroundSelectionTag('${tagName}');`);
    }

    const toggleSelectionTag = (tagName: string) => {
        webViewref.current?.injectJavaScript(`window.toggleSelectionTag('${tagName}');`);
    }

    return (
        <View style={{ height: webviewHeight, overflow: 'hidden' }}>
            <WebView
                ref={webViewref}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                contentMode={'mobile'}
                onMessage={handleMessage}
                onLoadEnd={handleLoadEnd}
                keyboardDisplayRequiresUserAction={false}
                style={[ props.bgColor ? { backgroundColor: props.bgColor} : {} , props.customStyles ? props.customStyles : {} ]}
            />
        </View>
    );
});

export default RichEditor;
