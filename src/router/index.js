import Vue from 'vue'
import Router from 'vue-router'

// 引入一级组件
import DashBoard from './../views/dashboard/DashBoard'
const Home = () => import('./../views/home/Home');
const Category  = () => import('./../views/category/Category');
const Cart = () => import('./../views/cart/Cart');

// 用户中心
const Mine = () => import('./../views/mine/Mine');
const UserContenr = () => import('./../views/mine/children/UserCenter');
const MineOrder = () => import('../views/mine/children/MineOrder');

// 引入组件相关
const Order = () => import('./../views/order/Order');
const OrderDetail = () => import('../views/order/children/OrderDetail');
const MyAddress = () => import('./../views/order/children/MyAddress');
const AddAddress = () => import('./../views/order/children/children/AddAddress');
const EditAddress = () => import('./../views/order/children/children/EditAddress');

// 引入登陆
const Login = () => import('./../views/login/Login');
const SelectLogin = () => import('./../views/login/SelectLogin');

Vue.use(Router);

export default new Router({
    routes: [
        {path: '/', redirect: '/dashboard'},
        {
            path: '/dashboard',  // 主面板
            name: 'dashboard',
            component: DashBoard,
            children: [
                {path: '/dashboard', redirect: '/dashboard/home'},
                {path: 'home', name: 'home', component: Home, meta: {keepAlive: true}},
                {path: 'category', name: 'category', component: Category, meta: {keepAlive: true}},
                {path: 'cart', name: 'cart', component: Cart},
                {
                    path: 'mine',
                    name: 'mine',
                    component: Mine,
                    children: [
                        {path: 'userCenter', component: UserContenr},  // 用户中心
                        {path: 'mineOrder', component: MineOrder}
                    ]
                },
            ]
        },
        {
            path: '/confirmOrder',  // 确认订单
            name: 'order',
            component: Order,
            children: [
                {
                    path: 'myAddress',
                    name: 'myAddress',
                    component: MyAddress,
                    children: [
                        // 添加地址
                        {path: 'addAddress', name: 'addAddress', component: AddAddress},
                        {path: 'editAddress', name: 'editAddress', component: EditAddress},
                    ]
                },
                {
                    path: 'orderDetail',
                    name: 'orderDetail',
                    component: OrderDetail
                }
            ]
        },
        {path: '/login', name: 'login', component: Login}
    ]
});
