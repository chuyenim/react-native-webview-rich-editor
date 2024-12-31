import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from 'react-native-webview';

const htmlContentTempl = `
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
    min-height: 20px;
    box-sizing: border-box;
    
  }
  #editor p {
    margin: 0;
    padding: 0;
  }
  #editor .mention {
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
}
</style>
<div id="editor" contenteditable="true" placeholder="Type something...">{{content}}</div>

<script type="text/javascript">
const editor = document.getElementById('editor');

function focustEditor() {
    editor.focus();
}

function blurtEditor() {
    editor.blur();
}

function insertHtml(html) {
    // Get the current selection
    const selection = window.getSelection();

   if (!selection || selection.rangeCount === 0) {
        editor.insertAdjacentHTML('beforeend', html);
        return;
    }

    // Get the HTML to insert
    // const htmlToInsert = '<div>Hello, world!</div>';

    // Insert the HTML at the current position
    document.execCommand('insertHTML', false, html);
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
    insertHtml: (html: string) => void;
    surroundSelection: (before: string, after: string) => void;
    surroundSelectionTag: (tagName: string) => void;
    toggleSelectionTag: (tagName: string) => void;
}
  
interface RichEditorProps {
  content: string;
  onChange?: (content: string) => void;
  placeholder?: string | undefined;
  viewStyles?: any;
  bgColor?: any;
}

const RichEditor = forwardRef<RichEditorRef, RichEditorProps>((props, ref) => {

    // const isAndroid = Platform.OS === 'android';
    const initialHeight = 20;
    const approxiate = 2;
    let timeout: NodeJS.Timeout | undefined;

  const [webviewHeight, setWebviewHeight] = useState(initialHeight);
  const [htmlContent, setHtmlContent] = useState(htmlContentTempl.replace('{{content}}', props.content || ''));
  const [content, setContent] = useState(props.content || '');
  const webViewref = React.useRef<WebView>(null);
  
    useImperativeHandle(ref, () => ({
        focus: () => focusEditor(),
        blur: () => blurEditor(),
        insertHtml: (html) => insertHtml(html),
        surroundSelection: (before, after) => surroundSelection(before, after),
        surroundSelectionTag: (tagName) => surroundSelectionTag(tagName),
        toggleSelectionTag: (tagName) => toggleSelectionTag(tagName),
    }));

    const handleMessage = useCallback(event => {
        // iOS already inherit from the whole document body height,
        // so we don't have to manually get it with the injected script
        // if (!isAndroid) {
        //   return;
        // }

        const data = JSON.parse(event.nativeEvent.data);

        if (!data) {
            return;
        }

        switch (data.event) {
            case 'documentHeight': {
                if (data.documentHeight !== 0 && (
                    data.documentHeight < webviewHeight + approxiate 
                    || data.documentHeight > webviewHeight + approxiate
                )) {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                    setWebviewHeight(data.documentHeight);
                    }, 50);
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

    useEffect(() => {
        if (props.placeholder) {
            webViewref.current?.injectJavaScript(`setPlaceholder('${props.placeholder}')`);
        }
    }, [props.placeholder]);

    useEffect(() => {
        props.onChange(content)
    }, [content]);

    const focusEditor = () => {
        webViewref.current?.injectJavaScript('focustEditor()');
    }

    const blurEditor = () => {
        webViewref.current?.injectJavaScript('blurtEditor()');
    }

    const insertHtml = (html: string) => {
        webViewref.current?.injectJavaScript(`window.insertHtml('${html}')`);
    }

    const surroundSelection = (before: string, after: string) => {
        webViewref.current?.injectJavaScript(`window.surroundSelection('${before}', '${after}')`);
    }

    const surroundSelectionTag = (tagName: string) => {
        webViewref.current?.injectJavaScript(`window.surroundSelectionTag('${tagName}')`);
    }

    const toggleSelectionTag = (tagName: string) => {
        webViewref.current?.injectJavaScript(`window.toggleSelectionTag('${tagName}')`);
    }

    return (
        <View style={{ flex: 1, height: webviewHeight, overflow: 'hidden' }}>
            <WebView
                ref={webViewref}
                originWhitelist={['*']}
                source={{ html: htmlContent }}
                contentMode={'mobile'}
                onMessage={handleMessage}
                style={[ props.bgColor ? { backgroundColor: props.bgColor} : {} , props.viewStyles ? props.viewStyles : {} ]}
            />
        </View>
    );
});

export default RichEditor;
