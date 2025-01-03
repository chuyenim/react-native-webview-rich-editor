[![Build Status](https://travis-ci.org/Sitebase/@chuyenim/react-native-webview-rich-editor.svg?branch=master)](https://travis-ci.org/Sitebase/@chuyenim/react-native-webview-rich-editor) [![npm downloads](https://img.shields.io/npm/dm/@chuyenim/react-native-webview-rich-editor.svg)](https://www.npmjs.com/package/@chuyenim/react-native-webview-rich-editor) [![version](https://img.shields.io/npm/v/@chuyenim/react-native-webview-rich-editor.svg)](https://www.npmjs.com/package/@chuyenim/react-native-webview-rich-editor) ![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/@chuyenim/react-native-webview-rich-editor.svg) ![npm type definitions](https://img.shields.io/npm/types/@chuyenim/react-native-webview-rich-editor.svg)

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

Here is an example of how to use the `RichTextInput` component in your React Native project:

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
                    <RichEditor ref={editorRef} value={plainHtml} onChange={setPlainHtml} bgColor={'#eee'} />
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

## Props

- `value`: The initial content to load into the editor.
- `onChange`: A callback function that is called when the content of the editor changes.
- `placeholder`: A placeholder text to display when the editor is empty.
- `customStyles`: Custom styles to apply to the editor.
- `bgColor`: Background color of the editor.
- `injectedCss`: Custom CSS to inject into the editor.

## Methods
The `RichEditor` component exposes the following methods via the ref:

- `focus()`: Focuses the editor.
- `blur()`: Blurs the editor.
- `setValue(html: string | null)`: Sets the HTML content of the editor.
- `insertHtml(html: string)`: Inserts the specified HTML at the current cursor position or at the end if no selection is made.
- `surroundSelection(before: string, after: string)`: Surrounds the current selection with the specified text.
- `surroundSelectionTag(tagName: string)`: Surrounds the current selection with the specified HTML tag.
- `toggleSelectionTag(tagName: string)`: Toggles the specified HTML tag around the current selection.
- `setPlaceholder(placeholder: string)`: Sets the placeholder text for the editor.
- `injectCss(css: string)`: Injects custom CSS into the editor.

# Contributing

Feel free to contribute to the repository and the development workflow.

# License

MIT
