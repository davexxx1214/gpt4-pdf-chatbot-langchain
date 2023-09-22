import warnings
warnings.filterwarnings('ignore')

import numpy as np
import pandas as pd
from datetime import datetime as dt
import yfinance as yf
from statistics import mean

# get daily data from yfinance
def get_daily_data(symbol, start, end):
    data = yf.download(tickers=symbol, start=start, end=end)
    return data

# moving averages strategy on close price data
# [!] implement any strategy you like across all stocks in your portfolio
def ma(data, ma1,ma2):
    # calculating moving averages
    data['ma_short'] = data['Close'].ewm(span=ma1).mean().shift()
    data['ma_long'] = data['Close'].ewm(span=ma2).mean().shift()

    # creating positions
    # data["position"] = [0]*len(data)
    data['position'] = np.where(data["ma_short"] > data["ma_long"], 1, 0)    
    data["strategy_returns"] = data["bnh_returns"] * data["position"]

    # returning strategy returns
    return data["strategy_returns"]

def buyandhold(data, portfolio_weight):
    # creating positions
    data["position"] = [0]*len(data)
    data["strategy_returns"] = data["bnh_returns"] * data["position"] * portfolio_weight
    # returning strategy returns
    return data["strategy_returns"]

# Cumulative returns fucntion
def get_cumulative_return(df):
    return list(df.cumsum())[-1]

#  Annualized sharpe ratio function
def get_annualized_sharpe_ratio(df):
    return 252**(1/2) * (df.mean() / df.std())

# backtesting parameters
days = 2000
end = dt.today()
start = end - pd.Timedelta(days=days)

# portfolio of stocks
portfolio_stocks = ["JCPB","BBAG","BBUS","BBIN","BBMC","BBSC","JEMA","JAVA","JGRO","JVAL","JMOM","JQUA"]

#portfolio_weigths= [0.24, 0.15, 0.14 ,0.12,0.12,0.08,0.08,0.05,0.02,]
#portfolio_weigths= [1, 0, 0 ,0,0,0,0,0,0,]

#portfolio_stocks = ["COST","AMZN","GOOG","AXP","MSFT","MMM","ANSS","BBY","KO",]


# defining a data frame to store portfolio returns
portfolio_strategy_returns = pd.DataFrame()
portfolio_bnh_returns = pd.DataFrame()

# buy and hold returns for individual stocs
bnh_stock_returns = []
bnh_stock_sharpe = []

# iterating over stocks in the portfolio
for idx, stock in enumerate(portfolio_stocks):

    data = get_daily_data(stock, start, end)
    
    # Calcuulating daily returns
    data["bnh_returns"] = np.log(data["Close"]/data["Close"].shift())
    
    # portfolio_weight = portfolio_weigths[idx]
    # print("portfolio_weigth =" , portfolio_weight )
    portfolio_strategy_returns[stock] = ma(data, ma1 = 3, ma2 = 8)
    #portfolio_strategy_returns[stock] = buyandhold(data,portfolio_weight)

    
    bnh_stock_returns.append(get_cumulative_return(data["strategy_returns"]))
    bnh_stock_sharpe.append(get_annualized_sharpe_ratio(data["strategy_returns"]))

print("\nSTRATEGY RETURNS ON PORTFOLIO")
portfolio_strategy_returns["Portfolio_retrun"] = portfolio_strategy_returns.mean(axis=1)
portfolio_strategy_returns.round(decimals = 4).head(10)

perf = pd.DataFrame(index=portfolio_stocks,columns=["Cumulative returns","Annualized Sharpe Ratio"])

for i,stock in enumerate(portfolio_stocks):
    cum_ret = bnh_stock_returns[i]
    anu_shp = bnh_stock_sharpe[i]
    perf.loc[stock] = [cum_ret,anu_shp]
    
perf

perf.mean()

print("Cumulative returns MA Stretegy                  :",get_cumulative_return(portfolio_strategy_returns["Portfolio_retrun"]))
print("Annualized sharpe ratio MA Strategy             :",get_annualized_sharpe_ratio(portfolio_strategy_returns["Portfolio_retrun"]))
print("\n")

#colors = ['tab:red','tab:blue','tab:green','tab:gray','tab:orange','tab:pink','tab:brown','tab:olive','tab:cyan','tab:red',"k"]
colors = ['tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:gray','tab:red',"k"]
portfolio_strategy_returns.cumsum().plot(figsize=(16,10), title="MOVING AVERAGES STRATEGY CUMULATIVE RETURNS", color=colors)