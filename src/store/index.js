import { createStore } from 'vuex'

// 购物车持久化
const loadCart = () => {
    const cart = localStorage.getItem('cart-list')
    return cart ? JSON.parse(cart) : {}
}
const saveCart = (cart) => {
    localStorage.setItem('cart-list', JSON.stringify(cart))
}

// 订单持久化
const loadOrders = () => {
    const orders = localStorage.getItem('order-list')
    return orders ? JSON.parse(orders) : []
}
const saveOrders = (orders) => {
    localStorage.setItem('order-list', JSON.stringify(orders))
}

export default createStore({
    state: {
        cartList: loadCart(),
        orderList: loadOrders()
    },
    mutations: {
        // ----------------- 购物车 mutations -----------------
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
        UPDATE_COUNT(state, { id, count }) {
            if (state.cartList[id]) {
                state.cartList[id].count = Math.max(1, count)
                saveCart(state.cartList)
            }
        },
        REMOVE_FROM_CART(state, id) {
            delete state.cartList[id]
            saveCart(state.cartList)
        },
        TOGGLE_CHECK(state, id) {
            if (state.cartList[id]) {
                state.cartList[id].checked = !state.cartList[id].checked
                saveCart(state.cartList)
            }
        },
        CHECK_ALL(state, checked) {
            Object.values(state.cartList).forEach(item => {
                item.checked = checked
            })
            saveCart(state.cartList)
        },

        // ----------------- 订单 mutations -----------------
        ADD_ORDER(state, order) {
            state.orderList.unshift(order)
            saveOrders(state.orderList)
        },
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
        }
    },
    actions: {
        addToCart({ commit }, product) {
            commit('ADD_TO_CART', product)
        },
        removeFromCart({ commit }, id) {
            commit('REMOVE_FROM_CART', id)
        },
        createOrder({ commit, state }, { remark = '' }) {
            const checkedItems = Object.values(state.cartList).filter(item => item.checked)
            if (checkedItems.length === 0) throw new Error('没有选中任何商品')
            const orderId = Date.now() + '' + Math.floor(Math.random() * 1000)
            const totalAmount = checkedItems.reduce((sum, item) => sum + (item.price * item.count) / 100, 0)
            const orderProducts = checkedItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                count: item.count,
                image: item.image
            }))
            const newOrder = {
                id: orderId,
                status: 'pending_payment',
                createTime: new Date().toISOString(),
                totalAmount: totalAmount.toFixed(2),
                products: orderProducts,
                remark
            }
            commit('ADD_ORDER', newOrder)
            for (const item of checkedItems) {
                commit('REMOVE_FROM_CART', item.id)
            }
            return newOrder
        },
        updateOrderStatus({ commit }, payload) {
            commit('UPDATE_ORDER_STATUS', payload)
        }
    },
    getters: {
        cartItems: (state) => Object.values(state.cartList),
        totalPrice: (state) => {
            return Object.values(state.cartList).reduce((total, item) => {
                if (item.checked) return total + (item.price * item.count)
                return total
            }, 0)
        },
        checkedCount: (state) => {
            return Object.values(state.cartList).reduce((count, item) => {
                return count + (item.checked ? item.count : 0)
            }, 0)
        },
        allOrders: (state) => [...state.orderList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        pendingPaymentOrders: (state) => state.orderList.filter(o => o.status === 'pending_payment'),
        pendingReceiptOrders: (state) => state.orderList.filter(o => o.status === 'pending_receipt'),
        reviewOrders: (state) => state.orderList.filter(o => o.status === 'review'),
        refundOrders: (state) => state.orderList.filter(o => o.status === 'refund')
    }
})