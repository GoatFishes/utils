const chai = require('chai')
const chaiHttp = require('chai-http')
const expect = chai.expect
chai.use(chaiHttp)
const { db, utils } = require('./api/index')

const keys = {
    "apiKeyID": "123-test",
    "apiKeySecret": "123-test"
}

sleep = m => new Promise(r => setTimeout(r, m))

describe('Bots API', () => {
    describe('database', () => {
        describe('keys', () => {
            describe('bot keys', () => {
                it('Should upload the keys of a bot to the databse', async () => {
                    await db.insertBotKeys(["defaultKeys", keys, "bitmex"])
                    let res = await db.selectAllKeys()
                    expect(res.length).to.equal(1)
                })

                it('Should not allow duplicated bot_id entries', async () => {
                    await db.insertBotKeys(["defaultKeys", keys, "bitmex"])
                    let res = await db.selectAllKeys()
                    expect(res.length).to.equal(1)
                })

                it('Should be able to check all persited information to the database', async () => {
                    let res = await db.selectAllKeys()
                    expect(res.length).to.equal(1)
                    expect(res[0]).to.have.property("id")
                    expect(res[0]).to.have.property("bot_id")
                    expect(res[0]).to.have.property("bot_key")
                    expect(res[0]).to.have.property("exchange")
                    expect(res[0].bot_key).to.have.property("apiKeyID")
                    expect(res[0].bot_key).to.have.property("apiKeySecret")
                    expect(res[0].id).to.not.be.null
                    expect(res[0].bot_id).to.not.be.null
                    expect(res[0].bot_key).to.not.be.null
                    expect(res[0].exchange).to.not.be.null
                    expect(res[0].bot_key.apiKeyID).to.not.be.null
                    expect(res[0].bot_key.apiKeySecret).to.not.be.null
                })

                it('Should be able to check all persited information to the database filtering by bot_id', async () => {
                    let res = await db.selectKeysByBotId(["defaultKeys"])
                    expect(res.length).to.equal(1)
                    expect(res[0]).to.have.property("id")
                    expect(res[0]).to.have.property("bot_id")
                    expect(res[0]).to.have.property("bot_key")
                    expect(res[0]).to.have.property("exchange")
                    expect(res[0].bot_key).to.have.property("apiKeyID")
                    expect(res[0].bot_key).to.have.property("apiKeySecret")
                    expect(res[0].id).to.not.be.null
                    expect(res[0].bot_id).to.not.be.null
                    expect(res[0].bot_key).to.not.be.null
                    expect(res[0].exchange).to.not.be.null
                    expect(res[0].bot_key.apiKeyID).to.not.be.null
                    expect(res[0].bot_key.apiKeySecret).to.not.be.null
                })

                after(async () => {
                    await db.TruncateTables()
                })
            })

            describe('exchange keys', () => {
                it('Should upload the keys of an exchnage to the databse', async () => {
                    await db.insertExchangeKeys(["bitmex", keys])
                    let res = await db.selectKeysByExchange(["bitmex"])
                    expect(res.length).to.equal(1)
                })

                it('Should not allow duplicated bot_id entries', async () => {
                    await db.insertExchangeKeys(["bitmex", keys])
                    let res = await db.selectKeysByExchange(["bitmex"])
                    expect(res.length).to.equal(1)
                })

                it('Should be able to check all persited information to the database', async () => {
                    let res = await db.selectKeysByExchange(["bitmex"])
                    expect(res.length).to.equal(1)
                    expect(res[0]).to.have.property("id")
                    expect(res[0]).to.have.property("exchange_key")
                    expect(res[0]).to.have.property("exchange")
                    expect(res[0].exchange_key).to.have.property("apiKeyID")
                    expect(res[0].exchange_key).to.have.property("apiKeySecret")
                    expect(res[0].id).to.not.be.null
                    expect(res[0].exchange_keys).to.not.be.null
                    expect(res[0].exchange).to.not.be.null
                })

                after(async () => {
                    await db.TruncateTables()
                })
            })
        })

        describe('bot_manager', () => {
            let res
            it('Should upload the a new bot to the databse', async () => {

                await db.insertBotStrategy(["defaultKeys", `const strategy = async (params) => {console.log(params)}`, 0.0, 0.0, 3009, null, 'Stop'])
                res = await db.selectBotByBotId(["defaultKeys"])
                expect(res.length).to.equal(1)
            })

            it('Should not allow duplicated bot_id entries', async () => {
                await db.insertBotStrategy(["defaultKeys", "", 0.0, 0.0, 3009, null])
                res = await db.selectBotByBotId(["defaultKeys"])
                expect(res.length).to.equal(1)
            })

            it('Should update the margin column of a bot record in the databse', async () => {
                await db.updateBotMargin([2.0, "defaultKeys"])
                res = await db.selectBotByBotId(["defaultKeys"])
                expect(res.length).to.equal(1)
                expect(res[0].margin).to.equal(2.0)
            })

            it('Should update the bot status', async () => {
                await db.updateBotStrategyStatus(["PaperTrade", "defaultKeys"])
                res = await db.selectBotByBotId(["defaultKeys"])
                expect(res.length).to.equal(1)
                expect(res[0]._status).to.equal("PaperTrade")
            })

            it('Should be able to check all persited information to the database', async () => {
                res = await db.selectBotByBotId(["defaultKeys"])
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("strategy")
                expect(res[0]).to.have.property("performance")
                expect(res[0]).to.have.property("margin")
                expect(res[0]).to.have.property("port_n")
                expect(res[0].id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].strategy).to.not.be.null
                expect(res[0].performance).to.not.be.null
                expect(res[0].margin).to.not.be.null
                expect(res[0].port_n).to.not.be.null
            })

            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('margin', () => {
            let date
            let res
            before(async () => {
                today = new Date()
                date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
            })

            it('Should insert a new margin record to the databse', async () => {
                await db.insertMargin([0, "defaultKeys", date])
                res = await db.selectMargin([0, date])
                expect(res.length).to.equal(1)
            })

            it('Should select all margin records to the databse', async () => {
                res = await db.selectMargin([0, date])
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("amount")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0].id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].amount).to.not.be.null
                expect(res[0]._timestamp).to.not.be.null
            })

            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('orders', () => {
            let res
            it('Should default to the lastest order in the database when no orders are present', async () => {
                res = await db.selectLatestOrder(["defaultKeys"])
                expect(res).to.equal("2007-01-01T00:00:00.000Z")
            })

            it('Should upload a new order to the databse', async () => {
                await db.insertOrder(["defaultKeys", "bitmex", "ab7ae2nf-c828-76fc-3190-a35883804599", null, "2019-08-08T01:04:28.939Z", "Open", "Buy", 1000, 8000, 4000, 10, "Limit", "10"])
                res = await db.selectOrders()
                expect(res.length).to.equal(1)
            })

            it('Should select an order by status Open', async () => {
                res = await db.selectOrdersByStatus(["Open"])
                expect(res.length).to.equal(1)
            })

            it('Should update the order status in the databse', async () => {
                await db.updateOrderStatus(["Closed", "ab7ae2nf-c828-76fc-3190-a35883804599"])
                res = await db.selectOrdersByStatus(["Closed"])
                expect(res[0].order_status).to.equal("Closed")
            })

            it('Should select the lastest order in the database when no orders are present', async () => {
                res = await db.selectLatestOrder(["defaultKeys"])
                expect(JSON.stringify(res)).to.equal('"2019-08-08T01:04:28.939Z"')
            })

            it('Should update the order position_ref in the databse', async () => {
                await db.updateOrderPositionId(["123456532-se24243-zred143452123", "ab7ae2nf-c828-76fc-3190-a35883804599"])
                res = await db.selectOrders()
                expect(res[0].position_ref).to.equal("123456532-se24243-zred143452123")
            })

            it('Should select all orders in the databse', async () => {
                res = await db.selectOrders()
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("order_id")
                expect(res[0]).to.have.property("position_ref")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0]).to.have.property("order_status")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("size")
                expect(res[0]).to.have.property("_price")
                expect(res[0]).to.have.property("margin")
                expect(res[0]).to.have.property("leverage")
                expect(res[0]).to.have.property("order_type")
                expect(res[0]).to.have.property("average_price")
                expect(res[0].id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].exchange).to.not.be.null
                expect(res[0].order_id).to.not.be.null
                expect(res[0].position_ref).to.not.be.null
                expect(res[0]._timestamp).to.not.be.null
                expect(res[0].order_status).to.not.be.null
                expect(res[0].side).to.not.be.null
                expect(res[0].size).to.not.be.null
                expect(res[0]._price).to.not.be.null
                expect(res[0].margin).to.not.be.null
                expect(res[0].leverage).to.not.be.null
                expect(res[0].order_type).to.not.be.null
                expect(res[0].average_price).to.not.be.null
            })

            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('positions', () => {
            let res
            it('Should upload a new position to the databse', async () => {
                await db.insertPosition(["1234567890-0765-'sdf12345d123", "defaultKeys", 10, 2.0, "2017-01-01T12:30:00.000Z", "2017-01-01T12:31:00.000Z", "Buy", 100, 0.0, 0.0, 10, 120])
                res = await db.selectPositions()
                expect(res.length).to.equal(1)
            })

            it('Should Select all positions in the database', async () => {
                res = await db.selectPositions()
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("position_id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("entry_price")
                expect(res[0]).to.have.property("init_margin")
                expect(res[0]).to.have.property("start_time")
                expect(res[0]).to.have.property("end_time")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("size")
                expect(res[0]).to.have.property("profit_loss")
                expect(res[0]).to.have.property("roe")
                expect(res[0]).to.have.property("leverage")
                expect(res[0]).to.have.property("average_price")
                expect(res[0].id).to.not.be.null
                expect(res[0].position_id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].init_margin).to.not.be.null
                expect(res[0].entry_price).to.not.be.null
                expect(res[0].start_time).to.not.be.null
                expect(res[0].end_time).to.not.be.null
                expect(res[0].side).to.not.be.null
                expect(res[0].size).to.not.be.null
                expect(res[0].profit_loss).to.not.be.null
                expect(res[0].roe).to.not.be.null
                expect(res[0].leverage).to.not.be.null
                expect(res[0].average_price).to.not.be.null
            })
            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('paper orders', () => {
            it('Should upload a new order to the databse', async () => {
                await db.insertPaperOrder(["defaultKeys", "bitmex", "ab7ae2nf-c828-76fc-3190-a35883804599", null, "2019-08-08T01:04:28.939Z", "Open", "Buy", 1000, 8000, 4000, 10, "Limit", "10"])
                let res = await db.selectPaperOrders()
                expect(res.length).to.equal(1)
            })

            it('Should select an order by status Open', async () => {
                let res = await db.selectPaperOrdersByStatus(["Open"])
                expect(res.length).to.equal(1)
            })

            it('Should update the order status in the databse', async () => {
                await db.updatePaperOrderStatus(["Closed", "ab7ae2nf-c828-76fc-3190-a35883804599"])
                let res = await db.selectPaperOrdersByStatus(["Closed"])
                expect(res[0].order_status).to.equal("Closed")
            })

            it('Should update the order position_ref in the databse', async () => {
                await db.updatePaperOrderPositionId(["123456532-se24243-zred143452123", "ab7ae2nf-c828-76fc-3190-a35883804599"])
                res = await db.selectPaperOrders()
                expect(res[0].position_ref).to.equal("123456532-se24243-zred143452123")
            })

            it('Should select all orders in the databse', async () => {
                res = await db.selectPaperOrders()
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("order_id")
                expect(res[0]).to.have.property("position_ref")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0]).to.have.property("order_status")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("size")
                expect(res[0]).to.have.property("_price")
                expect(res[0]).to.have.property("margin")
                expect(res[0]).to.have.property("leverage")
                expect(res[0]).to.have.property("order_type")
                expect(res[0]).to.have.property("average_price")
                expect(res[0].id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].exchange).to.not.be.null
                expect(res[0].order_id).to.not.be.null
                expect(res[0].position_ref).to.not.be.null
                expect(res[0]._timestamp).to.not.be.null
                expect(res[0].order_status).to.not.be.null
                expect(res[0].side).to.not.be.null
                expect(res[0].size).to.not.be.null
                expect(res[0]._price).to.not.be.null
                expect(res[0].margin).to.not.be.null
                expect(res[0].leverage).to.not.be.null
                expect(res[0].order_type).to.not.be.null
                expect(res[0].average_price).to.not.be.null
            })

            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('paper positions', () => {
            let res
            it('Should upload a new position to the databse', async () => {
                await db.insertPaperPosition(["1234567890-0765-'sdf12345d123", "defaultKeys", 10, 2.0, "2017-01-01T12:30:00.000Z", "2017-01-01T12:35:00.000Z", "Buy", 100, 0.0, 0.0, 10, 120])
                res = await db.selectPaperPositions()
                expect(res.length).to.equal(1)
            })

            it('Should Select all positions in the database', async () => {
                res = await db.selectPaperPositions()
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("position_id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("entry_price")
                expect(res[0]).to.have.property("init_margin")
                expect(res[0]).to.have.property("start_time")
                expect(res[0]).to.have.property("end_time")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("size")
                expect(res[0]).to.have.property("profit_loss")
                expect(res[0]).to.have.property("roe")
                expect(res[0]).to.have.property("leverage")
                expect(res[0]).to.have.property("average_price")
                expect(res[0].id).to.not.be.null
                expect(res[0].position_id).to.not.be.null
                expect(res[0].bot_id).to.not.be.null
                expect(res[0].init_margin).to.not.be.null
                expect(res[0].entry_price).to.not.be.null
                expect(res[0].start_time).to.not.be.null
                expect(res[0].end_time).to.not.be.null
                expect(res[0].side).to.not.be.null
                expect(res[0].size).to.not.be.null
                expect(res[0].profit_loss).to.not.be.null
                expect(res[0].roe).to.not.be.null
                expect(res[0].leverage).to.not.be.null
                expect(res[0].average_price).to.not.be.null
            })

            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('websockets', () => {
            it('Should upload a new websocket to the databse', async () => {
                await db.insertWebsocket(["bitmex", "1m", "XBTUSD"])
                let res = await db.selectWebsocketByExchange(["bitmex"])
                expect(res.length).to.equal(1)
            })

            it('Should select the keys of an exchange to the databse', async () => {
                let res = await db.selectWebsocketByExchange(["bitmex"])
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("asset")
                expect(res[0]).to.have.property("time_frame")
            })

            it('Should not insert a second websocket into the database', async () => {
                await db.insertWebsocket(["bitmex", "1m", "XBTUSD"])
                let res = await db.selectWebsocketByExchange(["bitmex"])
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("asset")
                expect(res[0]).to.have.property("time_frame")
            })
            after(async () => {
                await db.TruncateTables()
            })
        })

        describe('price history', () => {
            it('Should be able to inset price history data point', async () => {
                await db.insertPriceHistory(["XBTUSD", "1m", "bitmex", "2007-01-01T00:00:00.000Z", 200, 200, 200, 200, 20])
                res = await db.selectAllPriceHistory(["1m", "XBTUSD", "bitmex"])
                expect(res.length).to.equal(1)
            })

            it('Should be able to select the lastest price history', async () => {
                await db.insertPriceHistory(["XBTUSD", "1m", "bitmex", "2007-01-01T00:00:00.001Z", 200, 200, 200, 200, 20])
                res = await db.selectLatestPriceHistory(["1m", "XBTUSD", "bitmex"])
                expect(JSON.stringify(res[0]._timestamp)).to.equal('"2007-01-01T00:00:00.001Z"')
            })

            it('Should select all the history in the database', async () => {
                res = await db.selectAllPriceHistory(["1m", "XBTUSD", "bitmex"])
                expect(res.length).to.equal(2)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("pair")
                expect(res[0]).to.have.property("time_frame")
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0]).to.have.property("_open")
                expect(res[0]).to.have.property("_close")
                expect(res[0]).to.have.property("_high")
                expect(res[0]).to.have.property("_low")
                expect(res[0]).to.have.property("_volume")
                expect(res[0].id).to.not.be.null
                expect(res[0].pair).to.not.be.null
                expect(res[0].time_frame).to.not.be.null
                expect(res[0].exchange).to.not.be.null
                expect(res[0].position_ref).to.not.be.null
                expect(res[0]._open).to.not.be.null
                expect(res[0]._close).to.not.be.null
                expect(res[0]._high).to.not.be.null
                expect(res[0]._low).to.not.be.null
                expect(res[0]._volume).to.not.be.null
            })
        })

        describe('performance', () => {
            it('Should be able to inset THe performance of a strategy', async () => {
                await db.insertPerformance(["1", "1", "1", 1, "1", "1", "1", "1", "1"])
                res = await db.selectPerformance(["1m", "XBTUSD", "bitmex"])
                expect(res.length).to.equal(1)
            })

            it('Should correctly retrieve all the element of the performance of a strategy', async () => {
                await db.insertPerformance(["1", "1", "1", 1, "1", "1", "1", "1", "1"])
                res = await db.selectPerformance(["1m", "XBTUSD", "bitmex"])
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("avg_time")
                expect(res[0]).to.have.property("average_profit")
                expect(res[0]).to.have.property("overall_profit")
                expect(res[0]).to.have.property("number_of_trades")
                expect(res[0]).to.have.property("sharpe_ratio")
                expect(res[0]).to.have.property("longest_trade")
                expect(res[0]).to.have.property("shortest_trade")
                expect(res[0]).to.have.property("best_trade")
                expect(res[0]).to.have.property("worst_trade")
                expect(res[0].id).to.not.be.null
                expect(res[0].avg_time).to.not.be.null
                expect(res[0].average_profit).to.not.be.null
                expect(res[0].overall_profit).to.not.be.null
                expect(res[0].number_of_trades).to.not.be.null
                expect(res[0].sharpe_ratio).to.not.be.null
                expect(res[0].longest_trade).to.not.be.null
                expect(res[0].shortest_trade).to.not.be.null
                expect(res[0].best_trade).to.not.be.null
                expect(res[0].worst_trade).to.not.be.null
            })
        })

        describe('backtesting', () => {
            it('Should be able to inset THe performance of a strategy', async () => {
                await db.insertTrade([["XBTUSD", "Buy", "1", "1", "closed", "GoodTillCanceles", "2007-01-01T00:00:00.000Z", "10"]])
                res = await db.selectAllTrades()
                expect(res.length).to.equal(1)
            })

            it('Should be able to insert the performance of a strategy', async () => {
                await db.insertTrade([["XBTUSD", "Buy", "1", "1", "closed", "GoodTillCanceles", "2007-01-01T00:00:00.000Z", "10"]])
                res = await db.selectAllTrades()
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("symbol")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("order_qty")
                expect(res[0]).to.have.property("price")
                expect(res[0]).to.have.property("order_type")
                expect(res[0]).to.have.property("time_in_force")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0]).to.have.property("leverage")
                expect(res[0].symbol).to.not.be.null
                expect(res[0].side).to.not.be.null
                expect(res[0].order_qty).to.not.be.null
                expect(res[0].price).to.not.be.null
                expect(res[0].order_type).to.not.be.null
                expect(res[0].time_in_force).to.not.be.null
                expect(res[0]._timestamp).to.not.be.null
                expect(res[0].leverage).to.not.be.null
            })

            it('Should delete all the records of backtests', async () => {
                await db.cleanTrade()
                res = await db.selectAllTrades()
                expect(res.length).to.equal(0)
            })
        })
    })

    describe('utils', () => {
        describe('Analytics', () => {
            let res
            it('margin formula', async () => {
                res = await utils.marginFormula({ leverage: 10, orderQty: 10, price: 8000 })
                expect(res).to.eql(0.000125)
            })

            describe('average return', async () => {
                it('Order direction starts with Long', async () => {
                    orderDirection = "Long"
                    contractZeroCounter = 0
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Buy", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql("Long")
                    expect(res.assignedMargin).to.eql(2)
                    expect(res.liberatedMargin).to.eql(1)
                    expect(res.contractZeroCounter).to.eql(10)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('Order direction starts with Short', async () => {
                    orderDirection = "Short"
                    contractZeroCounter = 0
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Sell", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql("Short")
                    expect(res.assignedMargin).to.eql(2)
                    expect(res.liberatedMargin).to.eql(1)
                    expect(res.contractZeroCounter).to.eql(10)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('Order direction starts with Long continues with Long', async () => {
                    orderDirection = "Long"
                    contractZeroCounter = 1
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Buy", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })

                    expect(res.orderDirection).to.eql("Long")
                    expect(res.assignedMargin).to.eql(2)
                    expect(res.liberatedMargin).to.eql(1)
                    expect(res.contractZeroCounter).to.eql(11)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('Order direction starts with Long continues with Short', async () => {
                    orderDirection = "Long"
                    contractZeroCounter = 1
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Sell", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql("Long")
                    expect(res.assignedMargin).to.eql(1)
                    expect(res.liberatedMargin).to.eql(2)
                    expect(res.contractZeroCounter).to.eql(-9)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('Order direction starts with Short continues with Long', async () => {
                    orderDirection = "Short"
                    contractZeroCounter = 1
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Buy", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql("Short")
                    expect(res.assignedMargin).to.eql(1)
                    expect(res.liberatedMargin).to.eql(2)
                    expect(res.contractZeroCounter).to.eql(-9)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('Order direction starts with Short continues with Short', async () => {
                    orderDirection = "Short"
                    contractZeroCounter = 1
                    assignedMargin = 1
                    liberatedMargin = 1
                    percentagePerformanceAverage = []
                    order = { side: "Sell", price: 1, leverage: 10, order_qty: 10 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql("Short")
                    expect(res.assignedMargin).to.eql(2)
                    expect(res.liberatedMargin).to.eql(1)
                    expect(res.contractZeroCounter).to.eql(11)
                    expect(res.percentagePerformanceAverage).to.eql([])
                })

                it('ConstractzeroCounter = 0 at the end of the process', async () => {
                    orderDirection = "Short"
                    contractZeroCounter = 1
                    assignedMargin = 10
                    liberatedMargin = 10
                    percentagePerformanceAverage = []
                    order = { side: "Buy", price: 1, leverage: 10, order_qty: 1 }

                    res = await utils.avgReturn({ orderDirection, contractZeroCounter, assignedMargin, liberatedMargin, percentagePerformanceAverage, order })
                    expect(res.orderDirection).to.eql(null)
                    expect(res.assignedMargin).to.eql(0)
                    expect(res.liberatedMargin).to.eql(0)
                    expect(res.contractZeroCounter).to.eql(0)
                    expect(res.percentagePerformanceAverage).to.eql([1])
                })

                it('Should fail to calculate an average return', async () => {
                    res = await utils.avgReturn({}).catch((e) => {
                        expect(e.error).to.eql(`Fatal error on average return analyser :  TypeError: Cannot read property 'order_qty' of undefined`)
                        expect(e.response_code).to.eql(550)
                    })
                })
            })

            describe('average time', async () => {
                it('Number of Orders = 0', async () => {
                    let numberOfOrders = 0
                    let contractZeroCounter = 1
                    let endTime, startTime = ""
                    let orderTimes = []
                    let order = { _timestamp: "2019-08-08T01:04:28.939Z" }
                    let res = await utils.avgTime({ endTime, startTime, numberOfOrders, contractZeroCounter, orderTimes, order })

                    expect(res.startTime).to.eql("2019-08-08T01:04:28.939Z")
                    expect(res.endTime).to.eql(undefined)
                    expect(res.orderTimes).to.eql([])
                })

                it('Number of Orders != 0 and startTime == 0', async () => {
                    let numberOfOrders = 1
                    let contractZeroCounter = 0
                    let endTime, startTime = 0
                    let orderTimes = []
                    let order = { _timestamp: "2019-08-08T01:04:28.939Z" }
                    let res = await utils.avgTime({ endTime, startTime, numberOfOrders, contractZeroCounter, orderTimes, order })

                    expect(res.startTime).to.eql("2019-08-08T01:04:28.939Z")
                    expect(res.endTime).to.eql(undefined)
                    expect(res.orderTimes).to.eql([])
                })

                it('Number of Orders != 0 and startTime !=0', async () => {
                    let numberOfOrders = 1
                    let contractZeroCounter = 0
                    let endTime = 0
                    let startTime = new Date('2019-08-08T01:04:28.939Z')
                    let orderTimes = []
                    let order = { _timestamp: new Date('2019-08-09T01:04:28.939Z') }
                    let res = await utils.avgTime({ endTime, startTime, numberOfOrders, contractZeroCounter, orderTimes, order })

                    expect(res.startTime).to.eql(0)
                    expect(res.endTime).to.eql(0)
                    expect(res.orderTimes).to.eql([86400])
                })

                it('Should fail to calculate an average time', async () => {
                    res = await utils.avgTime({ numberOfOrders: "to" }).catch((e) => {
                        console.log(e)
                        expect(e.error).to.eql('Fatal error on average return analyser :  TypeError: Cannot read property order_qty of undefined')
                        expect(e.response_code).to.eql(550)
                    })
                })
            })

            describe('set vars', async () => {
                it('should asign vars its values', async () => {
                    let orderTimes = [12, 134, 133, 183]
                    let percentagePerformanceAverage = [12, 57, -36, 23]
                    let numberOfOrders = 40

                    res = await utils.setVars({ orderTimes, percentagePerformanceAverage, numberOfOrders })
                    expect(res.avgTimePerOrder).to.eql('1.93')
                    expect(res.averageReturn).to.eql('14.00')
                    expect(res.overallPerformance).to.eql('56.00')
                    expect(res.numberOfOrders).to.eql(40)
                    expect(res.sharpeRatio).to.eql('0.50')
                    expect(res.longestOrder).to.eql('3.05')
                    expect(res.shortestOrder).to.eql('0.20')
                    expect(res.bestOrder).to.eql('57.00')
                    expect(res.worstOrder).to.eql('-36.00')
                })

                it('should fail to assign vars', async () => {
                    let orderTimes = []
                    let percentagePerformanceAverage = []
                    let numberOfOrders = 0

                    res = await utils.setVars({ orderTimes, percentagePerformanceAverage, numberOfOrders }).catch((e) => {
                        expect(e.error).to.eql('Fatal error backtest stats calculations : TypeError: Reduce of empty array with no initial value')
                        expect(e.response_code).to.eql(550)
                    })
                })
            })
        })

        describe('Fetchers', async () => {
            describe('Fetch a link with a body', async () => {
                it('Should succesfully fetch a link with a body', async () => {
                    res = await utils.fetchLinkBody('https://httpbin.org/post', 'a=1', 'POST')
                    expect(res.headers.Accept).to.eql('*/*')
                })
            })
            describe('Fetch a link without a body', async () => {

                it('Should succesfully fetch a link without a body', async () => {
                    res = await utils.fetchLink('https://httpbin.org/get', 'GET')
                    expect(res.headers.Accept).to.eql('*/*')
                })
            })
        })

        describe('format error response', async () => {
            it('string containes ECONNREFUSED', async () => {
                utils.errorHandling('ECONNREFUSED')
            })

            it('string containes No keys on record', async () => {
                utils.errorHandling('No keys on record')
            })

            it('string containes Too Many Requests', async () => {
                utils.errorHandling('Too Many Requests')
            })

            it('string containes 443', async () => {
                utils.errorHandling('443')
            })

            it('string containes Forbidden', async () => {
                utils.errorHandling('Forbidden')
            })

            it('string containes Rate limit exceeded', async () => {
                await utils.errorHandling('Rate limit exceeded, retry in 2 seconds')
            })

            it('string doesn\'t contain anything', async () => {
                await utils.errorHandling('sqd')
            })

        })

        describe('errorHandling', async () => {
            it('shoudl return a response with an error code 550', async () => {
                res = await utils.formatErrorResponse({ response_code: 550, error: "qdi" }, "localhost:3001/test")
                expect(res.status).to.eql(550)
                expect(res.body.response_message).to.eql('qdi')
            })
            it('shoudl return a response with an error code 550', async () => {
                res = await utils.formatErrorResponse({ response_code: null, error: "qdi" }, "localhost:3001/test")
                expect(res.status).to.eql(500)
                expect(res.body.response_message).to.eql('SERVER ERROR')
            })
        })

        describe('Kafka', async () => {
            it('produce & consume a message', async () => {
                const messages = { "bot_id": "defaultKeys", "exchange": "bitmex", "data": [{ "orderID": "ab7ae2nf-c828-76fc-3190-a35883804599" }] }

                await utils.kafkaProduce("bitmexPriceStream", messages)

                let msg = await utils.consumer("bitmexPriceStream")
                let parsedMessage = JSON.parse(msg[0].value)

                expect(parsedMessage).to.have.property('bot_id')
                expect(parsedMessage).to.have.property('exchange')
                expect(parsedMessage).to.have.property('data')
                expect(parsedMessage.data[0]).to.have.property('orderID')

            })

            it('produce & groupConsume a message then pause the groupConsumer', async () => {
                let parsedMessage
                const consumer = await utils.groupConsumer("testGroup", "bitmexPriceStream")
                consumer.on('message', async (message) => {
                    parsedMessage = JSON.parse(message.value)
                })
                await sleep(1500)

                const messages = { "bot_id": "defaultKeys", "exchange": "bitmex", "data": [{ "orderID": "ab7ae2nf-c828-76fc-3190-a35883804599" }] }

                await utils.kafkaProduce("bitmexPriceStream", messages)

                await sleep(500)

                expect(parsedMessage).to.have.property('bot_id')
                expect(parsedMessage).to.have.property('exchange')
                expect(parsedMessage).to.have.property('data')
                expect(parsedMessage.data[0]).to.have.property('orderID')

                await utils.pauseConsumer("testGroup")
            })
        })

        describe('Order Setter', async () => {
            it('fail to set live leverage', async () => {
                await utils.setLiveLeverage({ leverageObject: "s", leverageBody: "0" }).catch((e) => {
                    expect(e.response_code).to.eql(550)
                    expect(e.error).to.eql('Fatal error on live leverage setting : FetchError: request to http://exchange_engine:3003/exchange_engine/positions/leverage failed, reason: getaddrinfo ENOTFOUND exchange_engine')
                })
            })

            it('fail to set live order', async () => {
                await utils.setLiveOrder({ leverageObject: "s", orderBody: "0" }).catch((e) => {
                    expect(e.response_code).to.eql(550)
                    expect(e.error).to.eql('Fatal error setting live order : FetchError: request to http://exchange_engine:3003/exchange_engine/orders/set failed, reason: getaddrinfo ENOTFOUND exchange_engine')
                })
            })

            it('set paper leverage', async () => {
                res = await utils.setPaperLeverage({ orderBody: { symbol: "XBTUSD", leverage: 10 }, leverageObject: { "XBTUSD": 10 } })
                expect(res.leverage).to.eql(10)
            })

            it('set paper order', async () => {
                await db.insertBotKeys((["defaultKeys", keys, "bitmex"]))
                await utils.setPaperOrder({ orderBody: { timestamp:"2007-01-01T00:00:00.000Z", symbol:'XBTUSD', orderType:"Limit", price:1, orderQty:1, side:'Buy', botId:"defaultKeys" }, leverageObject: { "XBTUSD": 10 } }).catch((e)=>{console.log(e)})
                res = await db.selectPaperOrders()
                expect(res.length).to.equal(1)
                expect(res[0]).to.have.property("id")
                expect(res[0]).to.have.property("bot_id")
                expect(res[0]).to.have.property("exchange")
                expect(res[0]).to.have.property("order_id")
                expect(res[0]).to.have.property("position_ref")
                expect(res[0]).to.have.property("_timestamp")
                expect(res[0]).to.have.property("order_status")
                expect(res[0]).to.have.property("side")
                expect(res[0]).to.have.property("size")
                expect(res[0]).to.have.property("_price")
                expect(res[0]).to.have.property("margin")
                expect(res[0]).to.have.property("leverage")
                expect(res[0]).to.have.property("order_type")
                expect(res[0]).to.have.property("average_price")
            })
        })
    })
})
