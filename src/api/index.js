const { logEvent } = require('./utils/logger')
const { kafkaProduce } = require('./utils/kafkaProducer')
const { errorHandling } = require('./utils/errorHandling')
const ExceptionHandler = require('./utils/ExceptionHandler')
const { fetchLinkBody, fetchLink } = require('./utils/fetcher')
const { formatErrorResponse } = require('./utils/formatErrorResponse')
const { marginFormula, avgReturn, avgTime, setVars } = require('./utils/analytics');
const { groupConsumer, pauseConsumer, consumer } = require('./utils/kafkaConsumer')
const { setLiveLeverage, setPaperLeverage, setLiveOrder, setPaperOrder } = require('./utils/orderSetter')
const { DB_PGPORT, DB_PGHOST, DB_PGUSER, DB_PGPASSWORD, DB_PGDATABASE, LOG_LEVELS, RESPONSE_CODES } = require('./utils/constants')
const { insertExchangeKeys, selectKeysByExchange, insertBotKeys, selectAllKeys, selectKeysByBotId, insertOrder, selectLatestOrder, selectOrdersByStatus, selectOrders, updateOrderStatus, updateOrderPositionId, insertPaperOrder, selectPaperOrders, selectPaperOrdersByStatus, updatePaperOrderStatus, updatePaperOrderPositionId, selectWebsocketByExchange, insertWebsocket, selectAllPriceHistory, selectLatestPriceHistory, insertPriceHistory, selectBotByBotId, insertBotStrategy, updateBotStrategyStatus, updateBotMargin, insertPosition, selectPositions, insertPaperPosition, selectPaperPositions, insertMargin, selectMargin, selectPerformance, insertPerformance, cleanTrade, insertTrade, selectAllTrades, TruncateTables } = require('./database/db')

module.exports = {
    utils: {
        logEvent,
        ExceptionHandler,
        kafkaProduce,
        errorHandling,
        formatErrorResponse,
        fetchLinkBody, fetchLink,
        groupConsumer, pauseConsumer, consumer,
        marginFormula, avgReturn, avgTime, setVars,
        setLiveLeverage, setPaperLeverage, setLiveOrder, setPaperOrder,
    }, 
    db:{
        insertExchangeKeys, selectKeysByExchange, insertBotKeys, selectAllKeys, selectKeysByBotId, insertOrder, selectLatestOrder, selectOrdersByStatus, selectOrders, updateOrderStatus, updateOrderPositionId, insertPaperOrder, selectPaperOrders, selectPaperOrdersByStatus, updatePaperOrderStatus, updatePaperOrderPositionId, selectWebsocketByExchange, insertWebsocket, selectAllPriceHistory, selectLatestPriceHistory, insertPriceHistory, selectBotByBotId, insertBotStrategy, updateBotStrategyStatus, updateBotMargin, insertPosition, selectPositions, insertPaperPosition, selectPaperPositions, insertMargin, selectMargin, selectPerformance, insertPerformance, cleanTrade, insertTrade, selectAllTrades, TruncateTables,
    },
    constants:{
        DB_PGPORT, DB_PGHOST, DB_PGUSER, DB_PGPASSWORD, DB_PGDATABASE, LOG_LEVELS, RESPONSE_CODES,
    }
}