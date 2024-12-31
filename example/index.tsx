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
