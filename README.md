## Important announcement
"The @chuyenim/react-native-webview-rich-editor" is an open project and I'm no longer **actively maintaining** it."

# @chuyenim/react-native-webview-rich-editor
@chuyenim/react-native-webview-rich-editor is a rich-text editor for react-native. We've created this library on top of Webview Api.

<img src="https://img001.prntscr.com/file/img001/Q4283IjQTmaNMC1TfEnPsQ.png" width="50%">

## Prerequisite

This package is using `react-native-webview`. Please follow [this document](https://github.com/react-native-community/react-native-webview/blob/master/docs/Getting-Started.md) to install it.

## Installation

#### Install using npm:

```sh
npm i @chuyenim/react-native-webview-rich-editor
```

#### Install using yarn:

```sh
yarn add @chuyenim/react-native-webview-rich-editor
```

## Usage

Here is a simple overview of our components usage.

```js
import React from "react";
import { useEffect, useRef, useState } from "react";
import { Button, ScrollView, Text, View } from "react-native";
import RichEditor, { RichEditorRef } from "@chuyenim/react-native-webview-rich-editor";

export default function HomeScreen() {
    const [plainHtml, setPlainHtml] = useState('<p>Hello,<br/>I am <strong>@Chris</strong></p><p><br/></p>');

    let editorRef = useRef<RichEditorRef>(null);

    useEffect(() => {
        console.log("plainHtml:", plainHtml);
    }, [plainHtml] );

    const handleFocus = () => {
        editorRef.current?.focus();
    };

    const handleBlur = () => {
        editorRef.current?.blur();
    };

    const handleInsertText = () => {
        editorRef.current?.insertHtml('<span class="mention">@Chris Nguyen</span> ');
    };

    const surroundSelectionTagBold = () => {
        editorRef.current?.toggleSelectionTag('strong');
    };

    const surroundSelectionTagItalic = () => {
        editorRef.current?.toggleSelectionTag('i');
    };

    const toggleSelectionTagH1 = () => {
        editorRef.current?.toggleSelectionTag('h1');
    };

    return (
        <ScrollView>
            <View style={{ padding: 16 }}>
                <View style={{ marginBottom: 20, padding: 10, backgroundColor: '#eee', minHeight: 20 }}>
                    <RichEditor ref={editorRef} content={plainHtml} onChange={setPlainHtml} bgColor={'#eee'} />
                </View>

                <Button onPress={handleFocus} title="Focus" />
                <Button onPress={handleBlur} title="Blur" />
                <Button onPress={handleInsertText} title="Insert HTML" />
                <Button onPress={surroundSelectionTagBold} title="Add Bold" />
                <Button onPress={surroundSelectionTagItalic} title="Add Italic" />
                <Button onPress={toggleSelectionTagH1} title="Add H1" />

            </View>
        </ScrollView>
    );
}
```

# RichEditor

RichEditor is the main component of this library. You may easily add it to your application.

## RichEditor Props

### `value`

Content of the rich editor.

| Type         | Required |
| ------------ | -------- |
| `html` | Yes       |

---

### `onChange`

The function to get changed content in editor.
| Type | Required |
| ----------- | ----------- |
| `function` | No |

---

#### `placeholder`

Placeholder text to show when editor is empty.
| Type | Required |
| ----------- | ----------- |
| `string` | No |

---
### `customStyles`

List of custom css to be added to Rich Editor box.
| Type | Required |
| ----------- | ----------- |
| `object[]` | No |

---

### `bgColor`

The background color of the rich editor. Warning: This style can be overided by `customStyles` option.
| Type | Required |
| ----------- | ----------- |
| `string` | No |

# Contributing

Feel free to contribute to the repository and the development workflow.

# License

MIT
