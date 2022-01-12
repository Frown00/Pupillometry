import { Form, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';

const normFile = (e: any) => {
  console.log('Upload event:', e);
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const FileSelectItem = () => {
  return (
    <Form.Item label="Source Files">
      <Form.Item
        name="files"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        noStyle
      >
        <Upload.Dragger name="files" beforeUpload={() => false} multiple>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to upload
          </p>
          <p className="ant-upload-hint">
            Support for a single or bulk upload.
          </p>
        </Upload.Dragger>
      </Form.Item>
    </Form.Item>
  );
};

export default FileSelectItem;
