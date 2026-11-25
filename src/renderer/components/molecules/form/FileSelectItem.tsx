import { Form, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadChangeParam, UploadFile } from 'antd/lib/upload/interface';

const normFile = (event: UploadChangeParam<UploadFile> | UploadFile[]) => {
  if (Array.isArray(event)) {
    return event;
  }
  return event.fileList;
};

const FileSelectItem = () => {
  return (
    <Form.Item label="Source Files" required>
      <Form.Item
        name="files"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: 'Select at least one CSV file' }]}
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
