import index, { createStore } from 'vuex'

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

// 地址信息持久化：从 localStorage 读取已保存的地址数据
const loadAddress = () => {
    const address = localStorage.getItem('address-list')
    return address ? JSON.parse(address) : []
}
// 地址信息持久化：将地址数据写入 localStorage
const saveAddress = (addresses) => {
    localStorage.setItem('address-list', JSON.stringify(addresses))
}

// 账户信息持久化
const loadAccount = () => {
    const account = localStorage.getItem('account-list')
    return account ? JSON.parse(account) : []
}
const saveAccount = (account) => {
    localStorage.setItem('account-list', JSON.stringify(account))
}

// 优惠券默认数据与存储键
const STORAGE_KEY_COUPON = 'cart_coupons'
const STORAGE_KEY_CHOSEN = 'cart_chosen_coupon'

const defaultCoupon = [
    {
        id: 1,
        name: '满100减10优惠券',
        amount: 1000, // 分
        threshold: 10000, // 分
        desc: '全场通用'
    }
]

// 浏览历史持久化
const loadHistory = () => {
    const data = localStorage.getItem('browse-history')
    return data ? JSON.parse(data) : []
}
const saveHistory = (list) => {
    localStorage.setItem('browse-history', JSON.stringify(list))
}

// 收藏持久化
const loadFavorites = () => {
    const data = localStorage.getItem('favorite-list')
    return data ? JSON.parse(data) : []
}
const saveFavorites = (list) => {
    localStorage.setItem('favorite-list', JSON.stringify(list))
}

// 优惠券持久化
const loadCoupons = () => {
    const data = localStorage.getItem(STORAGE_KEY_COUPON)
    if (data) {
        try {
            return JSON.parse(data)
        } catch {
            return defaultCoupon
        }
    }
    return defaultCoupon
}

const saveCoupons = (list) => {
    localStorage.setItem(STORAGE_KEY_COUPON, JSON.stringify(list))
}

const saveChosen = (index) => {
    localStorage.setItem(STORAGE_KEY_CHOSEN, String(index))
}

// Vuex 仓库：统一管理购物车、订单、售后记录、地址、账户数据记录
export default createStore({
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
                    count: product.count || 1,
                    tag: product.tag,
                    desc: product.desc,
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
        // 更新订单状态：status 为新状态，extra 用于附加字段
        UPDATE_ORDER_STATUS(state, { orderId, status, extra = {} }) {
            const index = state.orderList.findIndex(o => o.id == orderId)
            if (index !== -1) {
                state.orderList[index].status = status
                Object.assign(state.orderList[index], extra)
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
        // 地址列表替换
        SET_ADDRESS_LIST(state, newList) {
            state.addressList = newList
            saveAddress(state.addressList)
        },
        // 新增地址
        ADD_ADDRESS(state, addressData) {
            const newId = Date.now().toString()
            const newAddress = {
                id: newId,
                ...addressData,
                isDefault: addressData.isDefault || false
            }
            if (newAddress.isDefault) {
                state.addressList.forEach(item => item.isDefault = false)
            }
            state.addressList.push(newAddress)
            saveAddress(state.addressList)
        },
        // 根据 ID 更新地址
        UPDATE_ADDRESS(state, { id, addressData }) {
            const index = state.addressList.findIndex(item => item.id === id)
            if (index !== -1) {
                if (addressData.isDefault) {
                    state.addressList.forEach(item => item.isDefault = false)
                }
                state.addressList[index] = {
                    ...state.addressList[index],
                    ...addressData
                }
                saveAddress(state.addressList)
            }
        },
        // 根据 ID 删除地址
        DELETE_ADDRESS(state, id) {
            state.addressList = state.addressList.filter(item => item.id !== id)
            saveAddress(state.addressList)
        },
        // 设置默认地址
        SET_DEFAULT_ADDRESS(state, id) {
            state.addressList.forEach(item => {
                item.isDefault = item.id === id
            })
            saveAddress(state.addressList)
        },

        // ----------------- 账户 mutations -----------------
        ADD_TO_ACCOUNT(state, account) {
            const exists = state.accountList.some(a => a.username === account.username)
            if (!exists) {
                state.accountList.push({
                    username: account.username,
                    password: account.password,
                    avatar: account.avatar || ''
                })
                saveAccount(state.accountList)
            }
        },
        // 更新账户信息（密码、头像等）
        UPDATE_ACCOUNT_INFO(state, { username, newData }) {
            const index = state.accountList.findIndex(a => a.username === username)
            if (index !== -1) {
                Object.assign(state.accountList[index], newData)
                saveAccount(state.accountList)
            }
        },
        // ----------------- 收藏 mutations -----------------
        TOGGLE_FAVORITE(state, product) {
            const index = state.favoriteList.findIndex(p => p.id === product.id)
            if (index !== -1) {
                state.favoriteList.splice(index, 1)
            } else {
                state.favoriteList.unshift({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    tag: product.tag,
                    desc: product.desc,
                    addTime: new Date().toISOString()
                })
            }
            saveFavorites(state.favoriteList)
        }
    },
    state: {
        cartList: loadCart(),        // 购物车：以商品 id 为键的对象
        orderList: loadOrders(),     // 订单列表：数组，按创建时间倒序
        addressList: loadAddress(),  // 地址列表：数组
        accountList: loadAccount(),  // 账户列表：数组
        browseHistory: loadHistory(),
        favoriteList: loadFavorites(),
        refundRecords: []            // 售后记录：仅在内存中维护
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
        // 创建订单
        createOrder({ commit, state }, { remark = '', discount = 0, couponName = '' }) {
            const checkedItems = Object.values(state.cartList).filter(item => item.checked)
            if (checkedItems.length === 0) throw new Error('没有选中任何商品')
            const orderId = Date.now() + '' + Math.floor(Math.random() * 1000)
            const totalAmount = checkedItems.reduce((sum, item) => sum + (item.price * item.count) / 100, 0)
            const finalAmount = Math.max(0, totalAmount - discount / 100)
            const orderProducts = checkedItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                count: item.count,
                image: item.image,
                desc: item.desc
            }))
            const newOrder = {
                id: orderId,
                status: 'pending_payment',
                createTime: new Date().toISOString(),
                totalAmount: finalAmount.toFixed(2),
                originalAmount: totalAmount.toFixed(2),
                discount: (discount / 100).toFixed(2),
                couponName,
                products: orderProducts,
                remark
            }
            commit('ADD_ORDER', newOrder)
            for (const item of checkedItems) {
                commit('REMOVE_FROM_CART', item.id)
            }
            return newOrder
        },
        // 更新订单状态
        updateOrderStatus({ commit }, payload) {
            commit('UPDATE_ORDER_STATUS', payload)
        },
        // 创建售后记录
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
            commit('DELETE_ADDRESS', id)
        },
        setDefaultAddress({ commit }, id) {
            commit('SET_DEFAULT_ADDRESS', id)
        },
        toggleFavorite({ commit }, product) {
            commit('TOGGLE_FAVORITE', product)
        },
        // 更新账户信息（密码、头像等）
        updateAccountInfo({ commit }, payload) {
            commit('UPDATE_ACCOUNT_INFO', payload)
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
        totalNum: (state) => {
            return Object.values(state.cartList).reduce((sum, item) => sum + item.count, 0)
        },
        // 全部订单（按创建时间倒序）
        allOrders: (state) => [...state.orderList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        allProduct: (state) => [...state.favoriteList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        // 各状态订单筛选
        pendingPaymentOrders: (state) => state.orderList.filter(o => o.status === 'pending_payment'),
        pendingReceiptOrders: (state) => state.orderList.filter(o => o.status === 'pending_receipt'),
        reviewOrders: (state) => state.orderList.filter(o => o.status === 'review'),
        refundOrders: (state) => state.orderList.filter(o => o.status === 'refund'),
        // 售后记录
        refundRecords: (state) => state.refundRecords,
        pendingRefundRecords: (state) => state.refundRecords.filter(r => r.status === 'pending'),
        isFavorite: (state) => (id) => state.favoriteList.some(p => p.id === id),
        favoriteCount: (state) => state.favoriteList.length
    }
})
