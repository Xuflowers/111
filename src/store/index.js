import { createStore } from 'vuex'

// 购物车持久化：从 localStorage 读取已保存的购物车数据
const loadCart = () => {
    const cart = localStorage.getItem('cart-list')
    return cart ? JSON.parse(cart) : {}
}
// 购物车持久化：将购物车数据写入 localStorage
const saveCart = (cart) => {
    localStorage.setItem('cart-list', JSON.stringify(cart))
}

// 订单持久化：从 localStorage 读取已保存的订单数据
const loadOrders = () => {
    const orders = localStorage.getItem('order-list')
    return orders ? JSON.parse(orders) : []
}
// 订单持久化：将订单数据写入 localStorage
const saveOrders = (orders) => {
    localStorage.setItem('order-list', JSON.stringify(orders))
}

//地址信息持久化：从localStorage读取已保存的地址数据
const loadAddress = ()=>{
    const address = localStorage.getItem('address-list')
    return address ? JSON.parse(address) : []
}

//地址信息持久化：将地址信息写入localStorage
const saveAddress = (addresses)=>{
    localStorage.setItem('address-list', JSON.stringify(addresses))
}

// Vuex 仓库：统一管理购物车、订单、售后记录、地址数据记录
export default createStore({
    state: {
        cartList: loadCart(),        // 购物车：以商品 id 为键的对象
        orderList: loadOrders(),     // 订单列表：数组，按创建时间倒序
        addressList: loadAddress(),  // 地址列表：数组，按添加时间倒序
        refundRecords: []            // 售后记录：仅在内存中维护
    },
    mutations: {
        // ----------------- 购物车 mutations -----------------
        // 添加商品到购物车：已存在则数量 +1，否则新建条目
        ADD_TO_CART(state, product) {
            const id = product.id
            if (state.cartList[id]) {
                state.cartList[id].count += 1
            } else {
                state.cartList[id] = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    count: 1,
                    checked: true
                }
            }
            saveCart(state.cartList)
        },
        // 修改购物车商品数量（最小为 1）
        UPDATE_COUNT(state, { id, count }) {
            if (state.cartList[id]) {
                state.cartList[id].count = Math.max(1, count)
                saveCart(state.cartList)
            }
        },
        // 从购物车移除指定商品
        REMOVE_FROM_CART(state, id) {
            delete state.cartList[id]
            saveCart(state.cartList)
        },
        // 切换单个商品的选中状态
        TOGGLE_CHECK(state, id) {
            if (state.cartList[id]) {
                state.cartList[id].checked = !state.cartList[id].checked
                saveCart(state.cartList)
            }
        },
        // 全选 / 全不选
        CHECK_ALL(state, checked) {
            Object.values(state.cartList).forEach(item => {
                item.checked = checked
            })
            saveCart(state.cartList)
        },

        // ----------------- 订单 mutations -----------------
        // 新增订单（插到列表头部，最新订单显示在最前）
        ADD_ORDER(state, order) {
            state.orderList.unshift(order)
            saveOrders(state.orderList)
        },
        // 更新订单状态：status 为新状态，extra 用于附加字段（如支付时间、售后原因等）
        UPDATE_ORDER_STATUS(state, { orderId, status, extra = {} }) {
            const index = state.orderList.findIndex(o => o.id == orderId) // 使用 == 兼容字符串/数字
            if (index !== -1) {
                // 直接修改订单对象
                state.orderList[index].status = status
                Object.assign(state.orderList[index], extra)
                // 关键：强制触发响应式更新，确保 getters 重新计算
                state.orderList = [...state.orderList]
                saveOrders(state.orderList)
            }
        },
        // 新建售后记录
        CREATE_REFUND_RECORD(state, record) {
            state.refundRecords.unshift(record)
        },
        // 更新售后记录状态
        UPDATE_REFUND_STATUS(state, { refundId, status, extra = {} }) {
            const index = state.refundRecords.findIndex(r => r.refundId === refundId)
            if (index !== -1) {
                state.refundRecords[index].status = status
                Object.assign(state.refundRecords[index], extra)
                state.refundRecords = [...state.refundRecords]
            }
        },
        // ----------------- 地址 mutations -----------------
        //地址列表替换
        SET_ADDRERSS_LIST(state,newList){
            state.addressList = newList
            saveAddress(state.addressList)
        },
        // 新增地址（插到列表头部，最新地址显示在最前,id自动赋予）
        ADD_ADDRESS(state, addressData){
            const newId = Date.now().toString()
            const newAddress = {
                id: newId,
                ...addressData,
                isDefault: addressData.isDefault || false
            }
            if(newAddress.isDefault){
                state.addressList.forEach(item => item.isDefault = false)
            }
            state.addressList.push(newAddress)
            saveAddress(state.addressList)
        },
        //根据ID进行指定地址更新
        UPDATE_ADDRESS(state,{id,addressData}){
            const index = state.addressList.findIndex(item => item.id === id)
            if (index !== -1){
                if (addressData.isDefault){
                    state.addressList.forEach(item => item.isDefault = false)
                }
                state.addressList[index] = {
                    ...state.addressList[index],
                    ...addressData
                }
                saveAddress(state.addressList)
            }
        },
        //根据ID进行过滤删除
        DELTE_ADDRESS(state,id){
            state.addressList = state.addressList.filter(item => item.id !== id)
            saveAddress(state.addressList)
        },
        //将指定ID设置为默认地址，其余设置为非默认（isDefault设置true,其余false）
        SET_DEFAULT_ADDRESS(state,id){
            state.addressList.forEach(item=>{
                item.isDefault = item.id === id
            })
            saveAddress(state.addressList)
        }
    },
    actions: {
        // 添加商品到购物车
        addToCart({ commit }, product) {
            commit('ADD_TO_CART', product)
        },
        // 从购物车移除商品
        removeFromCart({ commit }, id) {
            commit('REMOVE_FROM_CART', id)
        },
        // 创建订单：基于购物车中已勾选的商品生成订单，并清空这些商品
        createOrder({ commit, state }, { remark = '' }) {
            const checkedItems = Object.values(state.cartList).filter(item => item.checked)
            if (checkedItems.length === 0) throw new Error('没有选中任何商品')
            // 生成订单号：时间戳 + 随机数
            const orderId = Date.now() + '' + Math.floor(Math.random() * 1000)
            // 计算订单总金额（price 单位为分，需转换为元）
            const totalAmount = checkedItems.reduce((sum, item) => sum + (item.price * item.count) / 100, 0)
            // 拷贝购物车商品快照到订单中
            const orderProducts = checkedItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                count: item.count,
                image: item.image
            }))
            const newOrder = {
                id: orderId,
                status: 'pending_payment',                  // 初始状态：待付款
                createTime: new Date().toISOString(),
                totalAmount: totalAmount.toFixed(2),
                products: orderProducts,
                remark
            }
            commit('ADD_ORDER', newOrder)
            // 提交订单后，将已下单的商品从购物车中清除
            for (const item of checkedItems) {
                commit('REMOVE_FROM_CART', item.id)
            }
            return newOrder
        },
        // 更新订单状态
        updateOrderStatus({ commit }, payload) {
            commit('UPDATE_ORDER_STATUS', payload)
        },
        // 创建售后记录：生成 refundId 并附带创建时间、初始状态
        createRefundRecord({ commit }, record) {
            const refundId = 'R' + Date.now() + Math.floor(Math.random() * 1000)
            commit('CREATE_REFUND_RECORD', {
                refundId,
                ...record,
                createTime: new Date().toISOString(),
                status: 'pending'
            })
            return refundId
        },
        // 更新售后记录状态
        updateRefundStatus({ commit }, payload) {
            commit('UPDATE_REFUND_STATUS', payload)
        },
        addAddress({ commit }, addressData) {
            commit('ADD_ADDRESS', addressData)
        },
        updateAddress({ commit }, payload) {
            commit('UPDATE_ADDRESS', payload)
        },
        deleteAddress({ commit }, id) {
            commit('DELETE_ADDRESS', id)   // 注意 mutation 名称应为 DELETE_ADDRESS
        },
        setDefaultAddress({ commit }, id) {
            commit('SET_DEFAULT_ADDRESS', id)
        }
    },
    getters: {
        // 购物车中所有商品（数组形式）
        cartItems: (state) => Object.values(state.cartList),
        // 已勾选商品总价（单位：分）
        totalPrice: (state) => {
            return Object.values(state.cartList).reduce((total, item) => {
                if (item.checked) return total + (item.price * item.count)
                return total
            }, 0)
        },
        // 已勾选商品的总件数
        checkedCount: (state) => {
            return Object.values(state.cartList).reduce((count, item) => {
                return count + (item.checked ? item.count : 0)
            }, 0)
        },
        // 购物车商品总件数（用于底部 Tab 角标）
        totalNum: (state)=>{
            return Object.values(state.cartList).reduce((sum, item) => sum + item.count, 0)
        },
        // 全部订单（按创建时间倒序）
        allOrders: (state) => [...state.orderList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        // 各状态订单筛选
        pendingPaymentOrders: (state) => state.orderList.filter(o => o.status === 'pending_payment'),  // 待付款
        pendingReceiptOrders: (state) => state.orderList.filter(o => o.status === 'pending_receipt'),  // 待收货
        reviewOrders: (state) => state.orderList.filter(o => o.status === 'review'),                    // 待评价
        refundOrders: (state) => state.orderList.filter(o => o.status === 'refund'),                    // 退款/售后中
        // 售后记录
        refundRecords: (state) => state.refundRecords,
        pendingRefundRecords: (state) => state.refundRecords.filter(r => r.status === 'pending')
    }
})