import React, { useRef } from 'react';
import { Editor } from 'primereact/editor';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import './RichTextEditor.scss';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Enter content...',
  height = '200px',
}) => {
  const editorRef = useRef<Editor>(null);

  const insertVariable = (variable: string) => {
    const editor = editorRef.current;
    if (editor) {
      const quill = (editor as any).getQuill();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, `{{${variable}}}`);
      }
    }
  };

  const variableOptions = [
    { label: 'User Name', value: 'user.name' },
    { label: 'User Email', value: 'user.email' },
    { label: 'Company Name', value: 'company.name' },
    { label: 'Current Date', value: 'date.current' },
    { label: 'Step Number', value: 'step.number' },
    { label: 'Total Steps', value: 'step.total' },
  ];

  const headerTemplate = () => {
    return (
      <div className="rich-text-toolbar">
        <span className="ql-formats">
          <select className="ql-header" defaultValue="0">
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="0">Normal</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-strike" />
        </span>
        <span className="ql-formats">
          <select className="ql-color" />
          <select className="ql-background" />
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <select className="ql-align">
            <option defaultValue />
            <option value="center" />
            <option value="right" />
            <option value="justify" />
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-link" />
          <button className="ql-image" />
          <button className="ql-code-block" />
        </span>
        <span className="ql-formats custom-toolbar">
          <Dropdown
            value={null}
            options={variableOptions}
            onChange={(e) => insertVariable(e.value)}
            placeholder="Insert Variable"
            className="variable-dropdown"
          />
        </span>
      </div>
    );
  };

  return (
    <div className="rich-text-editor">
      <Editor
        ref={editorRef}
        value={value}
        onTextChange={(e) => onChange(e.htmlValue || '')}
        headerTemplate={headerTemplate()}
        style={{ height }}
        placeholder={placeholder}
      />
      <div className="editor-footer">
        <small className="text-muted">
          Use variables like {'{'}{'{'}'user.name{'}'}{'}}'} to personalize content
        </small>
      </div>
    </div>
  );
};