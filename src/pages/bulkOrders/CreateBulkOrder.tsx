import {
  Button,
  Space,
  Typography,
  Input,
  Form,
  InputNumber,
  Select
} from 'antd';
import { startCase } from 'lodash';
import React from 'react';
import bulkOrdersContext from 'src/context/bulkOrders/bulkOrdersContext';
import {
  BulkOrder,
  BulkOrderStatus,
  PaymentMode,
  SalesOrder
} from 'src/models/types';
import { createBulkOrder } from 'src/services/bulkOrdersService';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import {
  calculateBulkOrderAmt,
  convertHamperOrderToSalesOrder,
  Hamper,
  HamperOrdersFormItem,
  hasValidHampers
} from '../../components/bulkOrders/bulkOrdersHelper';
import Hampers from '../../components/bulkOrders/createBulkOrder/hampers/Hampers';
import MessageTemplate from '../../components/bulkOrders/createBulkOrder/MessageTemplate';
import ConfirmationModalButton from '../../components/common/ConfirmationModalButton';
import DynamicFormItem from '../../components/common/DynamicFormItem';
import '../../styles/common/common.scss';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const CreateBulkOrder = () => {
  const { updateBulkOrderId } = React.useContext(bulkOrdersContext);

  const [form] = Form.useForm();
  const [hampersMap, setHampersMap] = React.useState<Map<string, Hamper>>(
    new Map()
  );

  const [msgTmpl, setMsgTmpl] = React.useState<string>('');
  const [disableFormBtns, setDisableFormBtns] = React.useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = React.useState<boolean>(false);

  const onFinish = (values: any) => {
    const salesOrders: SalesOrder[] = values.hamperOrdersList.map(
      (value: HamperOrdersFormItem) =>
        convertHamperOrderToSalesOrder(value, hampersMap)
    );
    const amount = calculateBulkOrderAmt(salesOrders);
    const bulkOrder: BulkOrder = {
      amount,
      paymentMode: values.paymentMode,
      payeeName: values.payeeName,
      payeeEmail: values.payeeEmail,
      payeeContactNo: values.payeeContactNo,
      ...(values.payeeRemarks && { payeeRemarks: values.payeeRemarks }),
      bulkOrderStatus: BulkOrderStatus.CREATED,
      salesOrders
    };

    // TODO: implement redirect to payment page
    setSubmitLoading(true);
    asyncFetchCallback(
      createBulkOrder(bulkOrder),
      (res) => {
        console.log(res);
        updateBulkOrderId(res.orderId);
      },
      (err) => console.log(err),
      { updateLoading: setSubmitLoading, delay: 500 }
    );
  };

  return (
    <div className='container-left' style={{ marginBottom: '2em' }}>
      <Title level={2}>Create Bulk Order</Title>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Text>
          Bulk orders allow you to send the same hamper to multiple addresses.
        </Text>
        <Title level={4} style={{ marginTop: 10 }}>
          Payee Details
        </Title>
        <Form
          form={form}
          name='basic'
          labelCol={{ span: 2 }}
          wrapperCol={{ span: 8 }}
          autoComplete='off'
          onValuesChange={(changedValues, allValues) =>
            console.log(changedValues, allValues)
          }
          onFinish={onFinish}
        >
          <Form.Item
            label='Name'
            name='payeeName'
            rules={[{ required: true, message: 'Please input your name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Email'
            name='payeeEmail'
            rules={[
              { type: 'email', message: 'Please input a valid email!' },
              { required: true, message: 'Please input your email!' }
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label='Contact No.'
            name='payeeContactNo'
            rules={[
              { required: true, message: 'Please input your contact number!' }
            ]}
          >
            <InputNumber
              controls={false}
              style={{ width: '100%' }}
              stringMode
            />
          </Form.Item>
          <Form.Item label='Company' name='payeeCompany'>
            <Input />
          </Form.Item>
          <Form.Item
            label='Payment Mode'
            name='paymentMode'
            rules={[
              { required: true, message: 'Please select a payment mode!' }
            ]}
          >
            <Select>
              {Object.values(PaymentMode).map((paymentMode) => (
                <Option key={paymentMode} value={paymentMode}>
                  {startCase(paymentMode.toLowerCase())}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label='Remarks' name='payeeRemarks'>
            <TextArea rows={3} />
          </Form.Item>
        </Form>
        {/* <Title level={4}>Excel Upload</Title>
        <Button type='primary' icon={<DownloadOutlined />}>
          Download Excel Template
        </Button>
        <Space align='start' size='large'>
          <Text>Upload Template (optional):</Text>
          <Upload maxCount={1}>
            <Button icon={<UploadOutlined />}>Click to upload template</Button>
          </Upload>
        </Space> */}
        <Space direction='vertical' style={{ width: '100%' }}>
          <Title level={4} style={{ marginTop: 10 }}>
            Hampers
          </Title>
          <Hampers
            hampers={[...hampersMap.values()]}
            updateHampers={(hampers) =>
              setHampersMap(
                new Map<string, Hamper>(
                  hampers.map((hamper) => [hamper.id, hamper])
                )
              )
            }
          />
        </Space>
        <Space direction='vertical' style={{ width: '100%' }}>
          <Title level={4}>Message Template</Title>
          <MessageTemplate msgTmpl={msgTmpl} updateMsgTmpl={setMsgTmpl} />
        </Space>
        <Title level={4}>Hamper Orders</Title>
        <Form
          name='hamperOrders'
          onFinish={onFinish}
          onValuesChange={(_, allValues) =>
            setDisableFormBtns(!allValues?.hamperOrdersList?.length)
          }
          form={form}
        >
          <DynamicFormItem
            formName='hamperOrders'
            addBtnTxt='Add Customer'
            disableAdd={!hasValidHampers([...hampersMap.values()])}
            formChildren={({ key, name, ...restField }) => (
              <>
                <Form.Item
                  {...restField}
                  name={[name, 'customerName']}
                  rules={[
                    { required: true, message: 'Customer name required' }
                  ]}
                  style={{ flex: 2 }}
                >
                  <Input placeholder='Customer Name' />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'customerContactNo']}
                  rules={[{ required: true, message: 'Contact no. required' }]}
                  style={{ flex: 1 }}
                >
                  <InputNumber
                    placeholder='Contact Number'
                    controls={false}
                    style={{ width: '100%' }}
                    stringMode
                  />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'hamperId']}
                  rules={[{ required: true, message: 'Hamper type required' }]}
                  style={{ flex: 0.5 }}
                >
                  <Select placeholder='Hamper'>
                    {[...hampersMap.values()].map((hamper) => (
                      <Option key={hamper.id} value={hamper.id}>
                        {hamper.hamperName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'quantity']}
                  rules={[{ required: true, message: 'Quantity required' }]}
                >
                  <InputNumber min={1} placeholder='Qty' />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'customerAddress']}
                  rules={[{ required: true, message: 'Address required' }]}
                  style={{ flex: 1 }}
                >
                  <Input placeholder='Address' />
                </Form.Item>
                <Form.Item
                  {...restField}
                  name={[name, 'postalCode']}
                  rules={[{ required: true, message: 'Postal code required' }]}
                  style={{ flex: 0.5 }}
                >
                  <Input placeholder='Postal Code' />
                </Form.Item>
              </>
            )}
          />
          <div className='container-spaced-out' style={{ marginTop: '2em' }}>
            {/* <Button style={{ flex: 1 }} onClick={() => form.resetFields()}>
              Cancel
            </Button> */}
            <ConfirmationModalButton
              modalProps={{
                title: 'Confirm Cancel',
                body: 'Are you sure you want to cancel all hamper orders?',
                onConfirm: () => {
                  form.resetFields();
                  setDisableFormBtns(true);
                }
              }}
              style={{ flex: 1 }}
              disabled={disableFormBtns}
            >
              Cancel
            </ConfirmationModalButton>
            <Form.Item style={{ flex: 1 }}>
              <Button
                type='primary'
                htmlType='submit'
                block
                disabled={disableFormBtns}
                loading={submitLoading}
              >
                Make Payment
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Space>
    </div>
  );
};

export default CreateBulkOrder;