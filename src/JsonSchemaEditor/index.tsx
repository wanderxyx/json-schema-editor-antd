import { message } from 'antd';
import { reaction } from 'mobx';
import { observer } from 'mobx-react';
import React, { createContext, ReactElement, useEffect, useState } from 'react';
import Editor from './components/editor';
import './index.less';
import Schema from './types/Schema';
import SchemaDescription from './types/SchemaDescription';

/**
 * @title JsonSchemaEditor
 */
export interface JsonSchemaEditorProps {
  /**
   * @zh 是否开启 mock
   */
  mock?: boolean;
  /**
   * @zh 是否展示 json 编辑器
   */
  jsonEditor?: boolean;
  /**
   * @zh Schema 变更的回调
   */
  onChange?: (schema: Schema) => void;
  /**
   * @zh 初始化 Schema
   */
  data?: Schema | string;
}

export const SchemaMobxContext = createContext<SchemaDescription>(
  new SchemaDescription(),
);

const JsonSchemaObserverEditor = observer((props: JsonSchemaEditorProps) => {
  const [contextVal] = useState<SchemaDescription>(new SchemaDescription());

  useEffect(() => {
    let defaultSchema;
    if (props.data) {
      if (typeof props.data === 'string') {
        try {
          defaultSchema = JSON.parse(props.data);
        } catch (e) {
          message.error('传入的字符串非 json 格式!');
        }
      } else if (
        Object.prototype.toString.call(props.data) === '[object Object]'
      ) {
        // fix data是空对象首行没有加号的bug
        if (!Object.keys(props.data).length) {
          defaultSchema = { type: 'object' };
        } else {
          defaultSchema = props.data;
        }
      } else {
        message.error('json数据只支持字符串和对象');
      }
    } else {
      defaultSchema = { type: 'object' };
    }
    contextVal.changeSchema(defaultSchema);
  }, [JSON.stringify(props.data)]);

  reaction(
    () => contextVal.schema,
    (schema) => {
      if (props.onChange) {
        props.onChange(JSON.parse(JSON.stringify(schema)));
      }
    },
  );

  // reaction(
  //   () => contextVal.open,
  //   (open) => {
  //     // eslint-disable-next-line no-console
  //     console.log(JSON.parse(JSON.stringify(open)));
  //   }
  // );

  return (
    <div>
      <SchemaMobxContext.Provider value={contextVal}>
        <Editor jsonEditor={props.jsonEditor} mock={props.mock} />
      </SchemaMobxContext.Provider>
    </div>
  );
});

const JsonSchemaEditor = (props: JsonSchemaEditorProps): ReactElement => {
  return (
    <>
      <JsonSchemaObserverEditor {...props} mock />
    </>
  );
};

export default JsonSchemaEditor;
