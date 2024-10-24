import React, { useState, useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import styles from './MinerDetails.module.css';

Chart.register(...registerables);

const GET_BITCOIN_OUTPUTS = gql`
query GetBitcoinOutputs($network: BitcoinNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
  bitcoin(network: $network) {
    outputs(
      options: {desc: "reward", asc: "address.address", limit: $limit, offset: $offset}
      time: {since: $from, till: $till}
      txIndex: {is: 0}
      outputDirection: {is: mining}
      outputScriptType: {notIn: ["nulldata", "nonstandard"]}
    ) {
      address: outputAddress {
        address
        annotation
      }
      reward: value
      reward_usd: value(in: USD)
      count(uniq: blocks)
      min_date: minimum(of: date)
      max_date: maximum(of: date)
    }
  }
}
`;

const GET_RECENT_BLOCKS = gql`
query GetRecentBlocks($network: BitcoinNetwork!) {
  bitcoin(network: $network) {
    blocks(options: {limit: 5, desc: "height"}) {
      height
      timestamp {
        time(format: "%Y-%m-%d %H:%M:%S")
      }
      transactionCount
    }
  }
}
`;

interface BitcoinPriceEntry {
  date: string;
  price: number;
}

const MinerDetails: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [tillDate, setTillDate] = useState<Date | null>(new Date());
  const navigate = useNavigate();

  const [fetchBitcoinOutputs, { called, loading, data, error }] = useLazyQuery(GET_BITCOIN_OUTPUTS, {
    fetchPolicy: 'network-only',
  });

  const [fetchRecentBlocks, { data: recentBlocksData }] = useLazyQuery(GET_RECENT_BLOCKS);

  const [bitcoinData, setBitcoinData] = useState<{ dates: string[]; prices: number[] }>({ dates: [], prices: [] });

  useEffect(() => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 25,
        offset: 0,
        from: fromDate?.toISOString(),
        till: tillDate?.toISOString(),
      },
    });
    fetchRecentBlocks({
      variables: {
        network: "bitcoin",
      },
    });

    // Fetch Bitcoin price data using Crypto Price API
    const fetchBitcoinPrices = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=1704067200&to=1735689599');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Extract dates and prices from the response
        const dates = data.prices.map((entry:any) => new Date(entry[0]).toLocaleDateString());
        const prices = data.prices.map((entry:any) => entry[1]);

        setBitcoinData({ dates, prices });
      } catch (error) {
        console.error('Error fetching Bitcoin prices:', error);
      }
    };

    fetchBitcoinPrices();
  }, []);


  const handleSearch = () => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 25,
        offset: 0,
        from: fromDate?.toISOString(),
        till: tillDate?.toISOString(),
      },
    });
    fetchRecentBlocks({
      variables: {
        network: "bitcoin",
      },
    });
  };

  const handleAddressClick = (address:string) => {
    navigate(`/address/${address}`, {
      state:{
        from :fromDate?.toISOString(),
        till :tillDate?.toISOString(),
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( Please try again</p>;

  const recentBlocks = recentBlocksData?.bitcoin.blocks || [];

  const chartData = {
    labels: bitcoinData.dates,
    datasets: [
      {
        label: 'Bitcoin Price (USD)',
        data: bitcoinData.prices,
        fill: false,
        backgroundColor: 'blue',
        borderColor: 'blue',
      },
    ],
  };

  return (
    <div className={styles.tableContainer}>
      <h2>Miner Details</h2>
      
      <div>
        <DatePicker className={styles.datePicker} selected={fromDate} onChange={(date) => date && setFromDate(date)} />
        <DatePicker className={styles.datePicker} selected={tillDate} onChange={(date) => date && setTillDate(date)} />
        <button className={styles.searchButton} onClick={handleSearch}>Search</button>
      </div>
      
      {recentBlocks.length > 0 && (
        <div className={styles.recentBlocksInfo}>
          <h3>Recent Blocks Information</h3>
          <table className={styles.recentBlocksTable}>
            <thead>
              <tr>
                <th>Height</th>
                <th>Timestamp</th>
                <th>Transaction Count</th>
              </tr>
            </thead>
            <tbody>
              {recentBlocks.map((block:any) => (
                <tr key={block.height}>
                  <td>{block.height}</td>
                  <td>{block.timestamp.time}</td>
                  <td>{block.transactionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bitcoin Price Chart */}
      <div>
        <h3>Bitcoin Price Over the Last Year</h3>
        <Line data={chartData} />
      </div>
      
      <div>
        <h3>Additional Details</h3>
      </div>
      
      {called && !loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              {["Miner", "Block Count", "First Block Date", "Last Block Date", "Block Reward, BTC"].map(header => (
                <th className={styles.th} key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.bitcoin.outputs.map((output:any,index:number) => (
              <tr key={index} onClick={() => handleAddressClick(output.address.address)} style={{ cursor:'pointer' }}>
                <td className={styles.td}>
                  <a className={styles.addressLink} onClick={(e) => {
                    e.stopPropagation();
                    handleAddressClick(output.address.address);
                  }}>
                    {output.address.address}
                  </a>
                </td>
                <td className={styles.td}>{output.count}</td>
                <td className={styles.td}>{output.min_date}</td>
                <td className={styles.td}>{output.max_date}</td>
                <td className={styles.td}>
                  {output.reward.toFixed(2)}{' '}
                  <sup style={{ color:'green' }}>
                    ${output.reward_usd.toLocaleString('en-US', { style:'currency', currency:'USD' }).slice(1)}
                  </sup>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MinerDetails;

// // In MinerDetails.tsx
// import React, { useState, useEffect } from 'react';
// import { useLazyQuery, gql } from '@apollo/client';
// import DatePicker from 'react-datepicker';
// import 'react-datepicker/dist/react-datepicker.css';
// import { useNavigate } from 'react-router-dom';
// import { Chart, registerables } from 'chart.js';
// import styles from './MinerDetails.module.css';

// Chart.register(...registerables);

// const GET_BITCOIN_OUTPUTS = gql`
// query GetBitcoinOutputs($network: BitcoinNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
//   bitcoin(network: $network) {
//     outputs(
//       options: {desc: "reward", asc: "address.address", limit: $limit, offset: $offset}
//       time: {since: $from, till: $till}
//       txIndex: {is: 0}
//       outputDirection: {is: mining}
//       outputScriptType: {notIn: ["nulldata", "nonstandard"]}
//     ) {
//       address: outputAddress {
//         address
//         annotation
//       }
//       reward: value
//       reward_usd: value(in: USD)
//     }
//   }
// }
// `;

// const GET_LATEST_BLOCK = gql`
// query GetLatestBlock($network: BitcoinNetwork!) {
//   bitcoin(network: $network) {
//     blocks(options: {limit: 1, desc: "height"}) {
//       height
//       timestamp {
//         time(format: "%Y-%m-%d %H:%M:%S")
//       }
//       transactionCount
//     }
//   }
// }
// `;

// const MinerDetails: React.FC = () => {
//   const [fromDate, setFromDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
//   const [tillDate, setTillDate] = useState<Date | null>(new Date());
//   const navigate = useNavigate();

//   const [fetchBitcoinOutputs, { called, loading, data, error }] = useLazyQuery(GET_BITCOIN_OUTPUTS, {
//     fetchPolicy: 'network-only',
//   });

//   const [fetchLatestBlock, { data: latestBlockData }] = useLazyQuery(GET_LATEST_BLOCK);

//   useEffect(() => {
//     fetchBitcoinOutputs({
//       variables: {
//         network: "bitcoin",
//         limit: 100,
//         offset: 0,
//         from: fromDate?.toISOString(),
//         till: tillDate?.toISOString(),
//       },
//     });
//     fetchLatestBlock({
//       variables: {
//         network: "bitcoin",
//       },
//     });
//   }, []);

//   const handleSearch = () => {
//     fetchBitcoinOutputs({
//       variables: {
//         network: "bitcoin",
//         limit: 100,
//         offset: 0,
//         from: fromDate?.toISOString(),
//         till: tillDate?.toISOString(),
//       },
//     });
//     fetchLatestBlock({
//       variables: {
//         network: "bitcoin",
//       },
//     });
//   };

//   const handleAddressClick = (address:string) => {
//     navigate(`/address/${address}`, {
//       state:{
//         from :fromDate?.toISOString(),
//         till :tillDate?.toISOString(),
//       }
//     });
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error :( Please try again</p>;

//   const latestBlock = latestBlockData?.bitcoin.blocks[0];

//   return (
//     <div className={styles.tableContainer}>
//       <h2>Miner Details</h2>
//       <div>
//         <DatePicker className={styles.datePicker} selected={fromDate} onChange={(date) => date && setFromDate(date)} />
//         <DatePicker className={styles.datePicker} selected={tillDate} onChange={(date) => date && setTillDate(date)} />
//         <button className={styles.searchButton} onClick={handleSearch}>Search</button>
//       </div>
      
//       {called && !loading && !error && (
//         <table className={styles.table}>
//           <thead>
//             <tr>
//               {["Miner", "Block Reward, BTC", "Latest Block Height", "Latest Block Timestamp", "Latest Block Transactions"].map(header => (
//                 <th className={styles.th} key={header}>{header}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {data?.bitcoin.outputs.map((output:any,index:number) => (
//               <tr key={index} onClick={() => handleAddressClick(output.address.address)} style={{ cursor:'pointer' }}>
//                 <td className={styles.td}>
//                   <a className={styles.addressLink} onClick={(e) => {
//                     e.stopPropagation();
//                     handleAddressClick(output.address.address);
//                   }}>
//                     {output.address.address}
//                   </a>
//                 </td>
//                 <td className={styles.td}>
//                   {output.reward.toFixed(2)}{' '}
//                   <sup style={{ color:'red' }}>
//                     ${output.reward_usd.toLocaleString('en-US', { style:'currency', currency:'USD' }).slice(1)}
//                   </sup>
//                 </td>
//                 <td className={styles.td}>{latestBlock?.height || 'N/A'}</td>
//                 <td className={styles.td}>{latestBlock?.timestamp.time || 'N/A'}</td>
//                 <td className={styles.td}>{latestBlock?.transactionCount || 'N/A'}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default MinerDetails;





/*
// In MinerDetails.tsx
import React, { useState, useEffect } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { Chart, registerables } from 'chart.js';
import styles from './MinerDetails.module.css';

Chart.register(...registerables);

const GET_BITCOIN_OUTPUTS = gql`
query GetBitcoinOutputs($network: BitcoinNetwork!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
  bitcoin(network: $network) {
    outputs(
      options: {desc: "reward", asc: "address.address", limit: $limit, offset: $offset}
      time: {since: $from, till: $till}
      txIndex: {is: 0}
      outputDirection: {is: mining}
      outputScriptType: {notIn: ["nulldata", "nonstandard"]}
    ) {
      address: outputAddress {
        address
        annotation
      }
      reward: value
      reward_usd: value(in: USD)
      count(uniq: blocks)
      min_date: minimum(of: date)
      max_date: maximum(of: date)
    }
  }
}
`;

const GET_LATEST_BLOCK = gql`
query GetLatestBlock($network: BitcoinNetwork!) {
  bitcoin(network: $network) {
    blocks(options: {limit: 1, desc: "height"}) {
      height
      timestamp {
        time(format: "%Y-%m-%d %H:%M:%S")
      }
      transactionCount
    }
  }
}
`;

const MinerDetails: React.FC = () => {
  const [fromDate, setFromDate] = useState<Date | null>(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [tillDate, setTillDate] = useState<Date | null>(new Date());
  const navigate = useNavigate();

  const [fetchBitcoinOutputs, { called, loading, data, error }] = useLazyQuery(GET_BITCOIN_OUTPUTS, {
    fetchPolicy: 'network-only',
  });

  const [fetchLatestBlock, { data: latestBlockData }] = useLazyQuery(GET_LATEST_BLOCK);

  useEffect(() => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 100,
        offset: 0,
        from: fromDate?.toISOString(),
        till: tillDate?.toISOString(),
      },
    });
    fetchLatestBlock({
      variables: {
        network: "bitcoin",
      },
    });
  }, []);

  const handleSearch = () => {
    fetchBitcoinOutputs({
      variables: {
        network: "bitcoin",
        limit: 100,
        offset: 0,
        from: fromDate?.toISOString(),
        till: tillDate?.toISOString(),
      },
    });
    fetchLatestBlock({
      variables: {
        network: "bitcoin",
      },
    });
  };

  const handleAddressClick = (address:string) => {
    navigate(`/address/${address}`, {
      state:{
        from :fromDate?.toISOString(),
        till :tillDate?.toISOString(),
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( Please try again</p>;

  const latestBlock = latestBlockData?.bitcoin.blocks[0];

  return (
    <div className={styles.tableContainer}>
      <h2>Miner Details</h2>
      <div>
        <DatePicker className={styles.datePicker} selected={fromDate} onChange={(date) => date && setFromDate(date)} />
        <DatePicker className={styles.datePicker} selected={tillDate} onChange={(date) => date && setTillDate(date)} />
        <button className={styles.searchButton} onClick={handleSearch}>Search</button>
      </div>
      
      {called && !loading && !error && (
        <table className={styles.table}>
          <thead>
            <tr>
              {["Miner", "Block Count", "First Block Date", "Last Block Date", "Block Reward, BTC", "Latest Block Height", "Latest Block Timestamp", "Latest Block Transactions"].map(header => (
                <th className={styles.th} key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.bitcoin.outputs.map((output:any,index:number) => (
              <tr key={index} onClick={() => handleAddressClick(output.address.address)} style={{ cursor:'pointer' }}>
                <td className={styles.td}>
                  <a className={styles.addressLink} onClick={(e) => {
                    e.stopPropagation();
                    handleAddressClick(output.address.address);
                  }}>
                    {output.address.address}
                  </a>
                </td>
                <td className={styles.td}>{output.count}</td>
                <td className={styles.td}>{output.min_date}</td>
                <td className={styles.td}>{output.max_date}</td>
                <td className={styles.td}>
                  {output.reward.toFixed(2)}{' '}
                  <sup style={{ color:'red' }}>
                    ${output.reward_usd.toLocaleString('en-US', { style:'currency', currency:'USD' }).slice(1)}
                  </sup>
                </td>
                <td className={styles.td}>{latestBlock?.height || 'N/A'}</td>
                <td className={styles.td}>{latestBlock?.timestamp.time || 'N/A'}</td>
                <td className={styles.td}>{latestBlock?.transactionCount || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MinerDetails;


*/