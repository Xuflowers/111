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
const loadUserCoupons = () =>{
    const data = localStorage.getItem('user-coupons')
    return data ? JSON.parse(data) : []
}
const saveUserCoupons = (coupons) => {
    localStorage.setItem('user-coupons',JSON.stringify(coupons))
}
const LEVELS = [
    { name: '青铜会员', min: 0,    max: 500,      index: 0 },
    { name: '白银会员', min: 500,  max: 1500,     index: 1 },
    { name: '黄金会员', min: 1500, max: 3000,     index: 2 },
    { name: '钻石会员', min: 3000, max: Infinity, index: 3 }
]

export const getLevelByPoints = (points) => {
    const p = Number(points) || 0
    return LEVELS.find(l => p >= l.min && p < l.max) || LEVELS[LEVELS.length - 1]
}

// 当前登录用户信息持久化：从 localStorage 读取
const loadUser = () => {
    const data = localStorage.getItem('user-info')
    return data ? JSON.parse(data) : null
}
// 当前登录用户信息持久化：写入 localStorage
const saveUser = (user) => {
    if (user) {
        localStorage.setItem('user-info', JSON.stringify(user))
    } else {
        localStorage.removeItem('user-info')
    }
}

// 将 userInfo 的字段变更同步到 accountList 中对应用户（按 username 匹配）
// 保证重新登录后积分、会员状态等不丢失
const syncToAccountList = (state, name, partial) => {
    if (!state.accountList || !name) return
    const index = state.accountList.findIndex(a => a.username === name)
    if (index >= 0) {
        Object.assign(state.accountList[index], partial)
        saveAccount(state.accountList)
    }
}

// 浏览历史持久化
const loadHistory = () => {
    const data = localStorage.getItem('browse-history')
    return data ? JSON.parse(data) : []
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
        // 合并优惠券在尾部
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
        // 更新订单状态：status 为新状态，extra 用于附加字段（合并到 order.extra 中）
        UPDATE_ORDER_STATUS(state, { orderId, status, extra = {} }) {
            const index = state.orderList.findIndex(o => o.id == orderId)
            if (index !== -1) {
                state.orderList[index].status = status
                // 确保 order.extra 存在，再将 extra 的字段合并到 order.extra 中
                if (!state.orderList[index].extra) {
                    state.orderList[index].extra = {}
                }
                Object.assign(state.orderList[index].extra, extra)
                state.orderList = [...state.orderList]
                saveOrders(state.orderList)
            }
        },
        // 删除订单（取消订单时使用）
        REMOVE_ORDER(state, orderId) {
            state.orderList = state.orderList.filter(o => o.id !== orderId)
            saveOrders(state.orderList)
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
        ADD_USER_COUPON(state,coupon){
            state.userCoupons.push(coupon)
            saveUserCoupons(state.userCoupons)
            // 同步到 accountList 中当前登录用户的 coupons 字段
            if (state.userInfo?.name) {
                const acc = state.accountList.find(a => a.username === state.userInfo.name)
                if (acc) {
                    if (!acc.coupons) acc.coupons = []
                    acc.coupons.push(coupon)
                    saveAccount(state.accountList)
                }
            }
        },
        UPDATE_USER_COUPON(state,{couponId, updates}) {
            const index = state.userCoupons.findIndex(c => c.id === couponId)
            if (index !== -1) {
                Object.assign(state.userCoupons[index], updates)
                saveUserCoupons(state.userCoupons)
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
                    avatar: account.avatar || '',
                    nickname: account.nickname || '用户123',
                    isVip: false,
                    levelPoints: 0,
                    availablePoints: 0,
                    pointsRecords: [],
                    coupons: account.coupons || []
                })
                saveAccount(state.accountList)
            }
        },
        // 登录时加载对应用户的券包到 userCoupons（按用户隔离）
        LOAD_USER_COUPONS(state, username) {
            const account = state.accountList.find(a => a.username === username)
            const userCoupons = account?.coupons || []
            state.userCoupons = userCoupons
            saveUserCoupons(userCoupons)
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
                    checked:false,
                    count:1,
                    addTime: new Date().toISOString()
                })
            }
            saveFavorites(state.favoriteList)
        },
        TOGGLE_FAVCHECK(state, id) {
            const index = state.favoriteList.findIndex(item => item.id === id)
            if (index !== -1) {
                state.favoriteList[index].checked = !state.favoriteList[index].checked
                saveFavorites(state.favoriteList)
            }
        },
        CHECK_FAVALL(state, checked) {
            Object.values(state.favoriteList).forEach(item => {
                item.checked = checked
            })
            saveFavorites(state.favoriteList)
        },
        // ----------------- 计时 mutations -----------------
        SET_REMAINING(state,{orderId, remaining}){
            if(!state.timers[orderId]){
                state.timers[orderId] = {}
                }
            state.timers[orderId].remaining = remaining
        },
        SET_TIMERS(state, { orderId, timers }){
            if(!state.timers[orderId]) return
            state.timers[orderId].timers = timers
        },
        CLEAR_TIMERS(state, orderId){
            if (state.timers[orderId] && state.timers[orderId].timers){
                clearInterval(state.timers[orderId].timers)
                state.timers[orderId].timers = null
            }
            delete  state.timers[orderId]
        },
        REMOVE_EXPIRED(state){},

        // ----------------- 用户信息 mutations -----------------
        // 设置/整体替换当前登录用户（登录、强制重置时使用）
        SET_USER_INFO(state, user) {
            // 兼容旧数据：只有 points 字段时迁移为 levelPoints/availablePoints
            if (user && user.points !== undefined && user.levelPoints === undefined) {
                user.levelPoints = user.points
                user.availablePoints = user.points
                delete user.points
            }
            // 兜底默认值，保证字段完整
            const safeUser = {
                isVip: false,
                nickname: '用户123',
                levelPoints: 0,
                availablePoints: 0,
                pointsRecords: [],
                ...user
            }
            state.userInfo = safeUser
            saveUser(safeUser)
        },
        // 局部更新用户信息（昵称、头像等），用新对象引用触发响应式
        UPDATE_USER_INFO(state, partial) {
            if (!state.userInfo) return
            state.userInfo = { ...state.userInfo, ...partial }
            saveUser(state.userInfo)
            // 同步到 accountList，保证重新登录后状态不丢失
            syncToAccountList(state, state.userInfo.name, partial)
        },
        // 清除当前登录用户（退出登录时使用）
        CLEAR_USER_INFO(state) {
            state.userInfo = null
            saveUser(null)
        },
        // ----------------- 积分 mutations -----------------
        ADD_USER_POINTS(state, points) {
            if (!state.userInfo)
                return
            state.userInfo = {
                ...state.userInfo,points: (state.userInfo.points || 0) + points
            }
            saveUser(state.userInfo)
            // 同步积分到 accountList，保证重新登录后积分不丢失
            syncToAccountList(state, state.userInfo.name, { points: state.userInfo.points })
        },
        EARN_POINTS(state, { amount,orderId }){
            if (!state.userInfo)
                return
            state.userInfo = {
                ...state.userInfo,
                levelPoints:(state.userInfo.levelPoints || 0) + amount,
                availablePoints:(state.userInfo.availablePoints || 0) + amount,
                pointsRecords: [
                    {id: Date.now(),type: 'earn',amount,source:'order',orderId,time:new Date().toString()},
                    ...(state.userInfo.pointsRecords || [])
                ]
            }
            saveUser(state.userInfo)
            syncToAccountList(state,state.userInfo.name,{ ...state.userInfo })
        },
        SPEND_POINTS(state,{ amount, source, itemId, itemName }){
            if (!state.userInfo)
                return false
            if((state.userInfo.availablePoints || 0) < amount)
                return false
            state.userInfo = {
                ...state.userInfo,
                availablePoints: state.userInfo.availablePoints - amount,
                pointsRecords:[
                    { id: Date.now(), type: 'spend', amount, source, itemId, itemName, time: new Date().toString() },
                    ...(state.userInfo.pointsRecords || [])
                ]
            }
            saveUser(state.userInfo)
            syncToAccountList(state, state.userInfo.name,{...state.userInfo})
            return true
        }
    },
    state: {
        cartList: loadCart(),        // 购物车：以商品 id 为键的对象
        orderList: loadOrders(),     // 订单列表：数组，按创建时间倒序
        addressList: loadAddress(),  // 地址列表：数组
        accountList: loadAccount(),  // 账户列表：数组
        browseHistory: loadHistory(),
        favoriteList: loadFavorites(),
        timers:{},
        refundRecords: [],           // 售后记录：仅在内存中维护
        userInfo: loadUser(),        // 当前登录用户信息（null 表示未登录）
        userCoupons: loadUserCoupons(),// 用户已兑换的优惠券列表
        couponList:[
            { id:'c1', name:'满100减20',cost: 100, desc:'满100可用', threshold:100, discount: 20, type: 'fixed', valueDesc: '20.0', unitDesc: '元'},
            { id:'c2', name:'满200减50',cost: 200, desc:'满200可用', threshold:200, discount: 50, type: 'fixed', valueDesc: '50.0', unitDesc: '元'},
            { id:'c3', name:'满500减100',cost: 400, desc:'满400可用', threshold:500, discount: 100, type: 'fixed', valueDesc: '100.0', unitDesc: '元'},
            { id:'c4', name:'整单九五折',cost: 80, desc:'满50可用', threshold:50, discountRate: 0.95, type: 'discount', valueDesc: '九五', unitDesc: '折'},
            { id:'c5', name:'整单八八折',cost: 160, desc:'满150可用', threshold:150, discountRate: 0.88, type: 'discount', valueDesc: '八八', unitDesc: '折'},
            { id:'c6', name:'整单七五折',cost: 340, desc:'满300可用', threshold:300, discountRate: 0.75, type: 'discount', valueDesc: '七五', unitDesc: '折'},
        ]
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
                username: state.userInfo?.name || '',
                status: 'pending_payment',
                createTime: new Date().toISOString(),
                expireTime: Date.now() + 15*60*1000,
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
        removeOrder({ commit }, orderId) {
            commit('REMOVE_ORDER', orderId)
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
        },
       checkExpireOrders({ commit, state }){
            const now = Date.now()
            state.orderList.forEach(order => {
                if (order.status === 'pending_payment' && order.expireTime && now >= order.expireTime){
                    commit('UPDATE_ORDER_STATUS',{
                        orderId:order.id,
                        status:'overtime',
                        extra:{ overtimeReason: '超出支付时间，订单已取消' }
                    })
                }
            })
        },
        startOrderTimer({ commit, dispatch, state},{ orderId, totalSeconds = 600}){
            if(state.timers[orderId] && state.timers[orderId].timers){
                clearInterval(state.timers[orderId].timers)
            }
            const now = Date.now()
            let storedExpireAt = localStorage.getItem(`order_timer_${orderId}`)
            let expireAt = storedExpireAt ? parseInt(storedExpireAt, 10) : now + totalSeconds * 1000
            if (!storedExpireAt){
                localStorage.setItem(`order_timer_${orderId}`,String(expireAt))
            }
            let remaining = Math.max(0,Math.floor((expireAt - now)/1000))
            commit('SET_REMAINING',{ orderId, remaining })
            if( remaining <= 0){
                dispatch("cancelOrderTimeout",orderId)
                return
            }
            const timers = setInterval(()=>{
                const now2 = Date.now()
                let newRemaining = Math.max(0, Math.floor((expireAt - now2)/1000))
                commit("SET_REMAINING",{orderId,remaining: newRemaining })
                if(newRemaining <= 0){
                    clearInterval(timers)
                    commit('CLEAR_TIMERS',orderId)
                    localStorage.removeItem(`order_timer_${orderId}`)
                    dispatch('cancelOrderTimeout',orderId)
                }
            },1000)
            commit("SET_TIMERS",{orderId, timers})
        },
        stopOrderTimer({commit, state},orderId){
            if(state.timers[orderId] && state.timers[orderId].timers){
                clearInterval(state.timers[orderId].timers)
            }
            commit('CLEAR_TIMERS',orderId)
            localStorage.removeItem(`order_timer_${orderId}`)
        },
        cancelOrderTimeout({commit, rootState }, orderId){
            commit('UPDATE_ORDER_STATUS',{
                orderId,
                status: 'overtime',
                extra: { cancelReason:'支付超时'}
            })
            localStorage.removeItem(`order_timer_${orderId}`)
            commit('CLEAR_TIMERS',orderId)
        },
        restoreOrderTimer({ dispatch,state }){
            const keys = Object.keys(localStorage)
            keys.filter(k => k.startsWith('order_timer_')).forEach(key => {
                const  orderId = key.replace('order_timer_','')
                if(!state.timers[orderId]){
                    dispatch('startOrderTimer',{ orderId })
                }
            })
        },
        // 扣减可用积分（等级积分不减少），同时写入积分流水
        spendPoints({ commit, state }, { amount, source, itemId, itemName }) {
            return new Promise((resolve, reject) => {
                if (!state.userInfo) {
                    reject(new Error('用户未登录'))
                    return
                }
                if ((state.userInfo.availablePoints || 0) < amount) {
                    reject(new Error('积分不足'))
                    return
                }
                commit('SPEND_POINTS', { amount, source, itemId, itemName })
                resolve()
            })
        },
        exchangeCoupons({commit,dispatch},{couponTemplate, cost, itemId, itemName }){
            return new Promise((resolve,reject) => {
                dispatch('spendPoints',{amount: cost,source:'coupon',itemId,itemName})
                    .then(() => {
                        const newCoupon = {
                            id: Date.now().toString(),
                            name: couponTemplate.name,
                            type: couponTemplate.type || 'fixed',
                            value: couponTemplate.value,                  // fixed 用：减免金额（分）
                            discountRate: couponTemplate.discountRate,    // discount 用：折扣率
                            threshold: couponTemplate.threshold,
                            condition: couponTemplate.condition,
                            available: 1,
                            reason: '',
                            startAt: Math.floor(Date.now()/1000),
                            endAt: Math.floor(Date.now()/1000) + 30 * 86400,
                            // 券左侧显示文本，直接取数据源预置字段
                            valueDesc: couponTemplate.valueDesc || '',
                            unitDesc: couponTemplate.unitDesc || '',
                        }
                        commit('ADD_USER_COUPON',newCoupon)
                        resolve(newCoupon)
                    })
                    .catch(reject)
            })
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
        // 购物车
        checkedCount: (state) => {
            return Object.values(state.cartList).reduce((count, item) => {
                return count + (item.checked ? item.count : 0)
            }, 0)
        },
        // 收藏
        checkedFavCount: (state) => {
            return state.favoriteList.filter(item => item.checked).length
        },
        // 购物车商品总件数（用于底部 Tab 角标）
        totalNum: (state) => {
            return Object.values(state.cartList).reduce((sum, item) => sum + item.count, 0)
        },
        // 全部订单（按创建时间倒序，仅当前登录用户的订单）
        allOrders: (state) => [...state.orderList]
            .filter(o => o.username === (state.userInfo?.name || ''))
            .sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        allProduct: (state) => [...state.favoriteList].sort((a, b) => new Date(b.createTime) - new Date(a.createTime)),
        // 各状态订单筛选（仅当前登录用户）
        pendingPaymentOrders: (state) => state.orderList.filter(o => o.username === (state.userInfo?.name || '') && o.status === 'pending_payment'),
        pendingReceiptOrders: (state) => state.orderList.filter(o => o.username === (state.userInfo?.name || '') && o.status === 'pending_receipt'),
        reviewOrders: (state) => state.orderList.filter(o => o.username === (state.userInfo?.name || '') && o.status === 'review'),
        refundOrders: (state) => state.orderList.filter(o => o.username === (state.userInfo?.name || '') && o.status === 'refund'),
        // 售后记录
        refundRecords: (state) => state.refundRecords,
        pendingRefundRecords: (state) => state.refundRecords.filter(r => r.status === 'pending'),
        isFavorite: (state) => (id) => state.favoriteList.some(p => p.id === id),
        favoriteCount: (state) => state.favoriteList.length,
        // 倒计时
        getRemaining:(state)=>(orderId)=>{
            return state.timers[orderId] ? state.timers[orderId].remaining : null
        }
    }
})
