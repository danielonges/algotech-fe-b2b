import { SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Divider,
  Input,
  Space,
  Table,
  TableColumnsType,
  Typography
} from 'antd';
import { startCase } from 'lodash';
import moment from 'moment';
import React from 'react';
import {
  createSearchParams,
  NavigateFunction,
  useNavigate
} from 'react-router-dom';
import { VIEW_BULK_ORDER_URL } from 'src/components/routes/routes';
import authContext from 'src/context/auth/authContext';
import { BulkOrder, SalesOrder, SalesOrderItem } from 'src/models/types';
import { getBulkOrdersByEmail } from 'src/services/bulkOrdersService';
import asyncFetchCallback from 'src/services/util/asyncFetchCallback';
import { READABLE_DDMMYY_TIME } from 'src/utils/dateUtils';
import '../../styles/common/common.scss';

const { Title, Text } = Typography;

const columns = (navigate: NavigateFunction): TableColumnsType<BulkOrder> => [
  {
    title: 'Order ID',
    dataIndex: 'orderId',
    width: '10%'
    // key: 'orderId'
  },
  {
    title: 'Created Date',
    dataIndex: 'createdTime',
    render: (value) => moment(value).format(READABLE_DDMMYY_TIME)
    // key: 'orderId'
  },
  {
    title: 'Order Status',
    dataIndex: 'bulkOrderStatus',
    render: (value) => startCase(value.toLowerCase())
    // key: 'orderId'
  },
  {
    title: 'Payment Mode',
    dataIndex: 'paymentMode',
    render: (value) => startCase(value.toLowerCase())
    // key: 'orderId'
  },
  {
    title: 'Order Total',
    dataIndex: 'amount',
    align: 'right',
    render: (value) =>
      `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
  },
  {
    title: 'Remarks',
    dataIndex: 'payeeRemarks'
    // key: 'orderId'
  },
  {
    title: 'Action',
    dataIndex: 'orderId',
    render: (value) => (
      <Button
        type='primary'
        onClick={() =>
          navigate({
            pathname: VIEW_BULK_ORDER_URL,
            search: createSearchParams({
              orderId: value
            }).toString()
          })
        }
      >
        View Order
      </Button>
    )
  }
];

const salesOrderColumns: TableColumnsType<SalesOrder> = [
  {
    title: 'Customer Name',
    dataIndex: 'customerName'
  },
  {
    title: 'Contact No.',
    dataIndex: 'customerContactNo'
  },
  {
    title: 'Address',
    dataIndex: 'customerAddress'
  },
  {
    title: 'Postal Code',
    dataIndex: 'postalCode'
  },
  {
    title: 'Order Amount',
    dataIndex: 'amount',
    render: (value) =>
      `$${value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`
  },
  {
    title: 'Order Items',
    dataIndex: 'salesOrderItems',
    width: '30%',
    render: (value) => (
      <Space direction='vertical'>
        {(value as SalesOrderItem[]).map((salesOrderItem, index) => (
          <Space key={salesOrderItem.id!}>
            <Text>{`${index + 1}.`}</Text>
            <Text>{`${salesOrderItem.quantity}x`}</Text>
            <Divider type='vertical' style={{ background: '#C5C5C5' }} />
            <Text>{salesOrderItem.productName}</Text>
          </Space>
        ))}
      </Space>
    )
  }
];

type SalesOrderTableProps = {
  salesOrders: SalesOrder[];
};

const SalesOrderTable = ({ salesOrders }: SalesOrderTableProps) => {
  return (
    <Table
      rowKey={(record) => record.orderId!}
      columns={salesOrderColumns}
      dataSource={salesOrders}
      pagination={false}
    />
  );
};

const MyOrders = () => {
  const { user } = React.useContext(authContext);
  const [bulkOrders, setBulkOrders] = React.useState<BulkOrder[]>([]);
  const [searchField, setSearchField] = React.useState<string>('');

  const navigate = useNavigate();

  const filteredData = React.useMemo(
    () =>
      bulkOrders.filter((bulkOrder) => {
        const { orderId, bulkOrderStatus, paymentMode, payeeRemarks } =
          bulkOrder;
        const searchFieldLower = searchField.toLowerCase();
        return (
          orderId.includes(searchFieldLower) ||
          bulkOrderStatus.toLowerCase().includes(searchFieldLower) ||
          paymentMode.toLowerCase().includes(searchFieldLower) ||
          payeeRemarks?.toLowerCase().includes(searchFieldLower)
        );
      }),
    [bulkOrders, searchField]
  );

  React.useEffect(() => {
    if (user?.email) {
      asyncFetchCallback(getBulkOrdersByEmail(user.email), setBulkOrders);
    }
  }, [user?.email]);

  return (
    <Space size='middle' direction='vertical' style={{ width: '100%' }}>
      <Title level={2}>My Orders</Title>
      <Input
        placeholder='Search'
        size='large'
        style={{ width: '25rem' }}
        suffix={<SearchOutlined />}
        onChange={(e) => setSearchField(e.target.value)}
      />
      <Table
        rowKey={(record) => record.orderId}
        columns={columns(navigate)}
        dataSource={filteredData}
        expandable={{
          expandedRowRender: (record) => (
            <SalesOrderTable salesOrders={record.salesOrders} />
          )
        }}
      />
    </Space>
  );
};

export default MyOrders;