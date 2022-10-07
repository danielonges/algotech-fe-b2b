import { Image, Layout, Menu, MenuProps, Typography } from 'antd';
import '../../styles/common/appHeader.scss';
import logo from '../../resources/logo-blue.png';
import authContext from '../../context/auth/authContext';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FRONT_SLASH } from '../../utils/constants';
import { UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

export const ROOT_NAV_URLS = {
  PRODUCTS: '/products',
  CUSTOMER: '/customer',
  DISTRIBUTOR: '/distributor',
  MY_ORDERS: '/myOrders',
  MY_ACCOUNT: '/myAccount'
};

const menuItems: MenuProps['items'] = [
  {
    label: <Link to={ROOT_NAV_URLS.PRODUCTS}>Products</Link>,
    key: ROOT_NAV_URLS.PRODUCTS
  },
  {
    label: <Link to={ROOT_NAV_URLS.CUSTOMER}>Customer</Link>,
    key: ROOT_NAV_URLS.CUSTOMER
  },
  {
    label: <Link to={ROOT_NAV_URLS.DISTRIBUTOR}>Distributor</Link>,
    key: ROOT_NAV_URLS.DISTRIBUTOR
  },
  {
    label: <Link to={ROOT_NAV_URLS.MY_ORDERS}>My Orders</Link>,
    key: ROOT_NAV_URLS.MY_ORDERS
  },
];

const AppHeader = () => {
  const location = useLocation();
  const { isAuthenticated, logout } = React.useContext(authContext);
  const currentRootNav =
    FRONT_SLASH + (location.pathname.split(FRONT_SLASH)[1] ?? '');

  //TODO: set back conditional rendering to be based on isAuthenticated
  return (
    <Header className='navbar'>
      {true && (
        <>
          <div className='logo'>
            <Text className='logo-text'>The Kettle Gourmet</Text>
            <Image
              src={logo}
              width={50}
              preview={false}
              style={{ marginLeft: 5 }}
            />
          </div>
          <Menu
            theme='dark'
            mode='horizontal'
            disabledOverflow={true}
            style={{ marginLeft: 45 }}
            selectedKeys={[currentRootNav]}
            items={menuItems}
          />

          <Menu mode='horizontal' theme='dark' >
            <Menu.SubMenu key='SubMenu' icon={<UserOutlined />}>
              <Menu.Item key='one'>
                <Link to={ROOT_NAV_URLS.MY_ACCOUNT}>My Account</Link>
              </Menu.Item>
              <Menu.Item key='two' onClick={logout}> 
                Logout
              </Menu.Item>
            </Menu.SubMenu>
          </Menu>
        </>
      )}
    </Header>
  );
};

export default AppHeader;
