import React, { useEffect, useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import { useParams, useLocation } from 'react-router-dom';
import styles from './AddressDetails.module.css'; 

type LocationState = {
  from: string;
  till: string;
};

const GET_ADDRESS_DETAILS = gql`
query GetAddressDetails($network: BitcoinNetwork!, $address: String!, $from: ISO8601DateTime, $till: ISO8601DateTime) {
  bitcoin(network: $network) {
    inputs(date: {since: $from, till: $till}, inputAddress: {is: $address}) {
      count
      value
      value_usd: value(in: USD)
      min_date: minimum(of: date)
      max_date: maximum(of: date)
    }
    outputs(date: {since: $from, till: $till}, outputAddress: {is: $address}) {
      count
      value
      value_usd: value(in: USD)
      min_date: minimum(of: date)
      max_date: maximum(of: date)
    }
  }
}
`;

function AddressDetails() {
  const { address } = useParams<{ address: string }>(); // Type assertion for useParams
  const location = useLocation();
  const state = location.state as LocationState; // Type assertion for useLocation state

  const [fromDate, setFromDate] = useState(state.from);
  const [tillDate, setTillDate] = useState(state.till);

  const [fetchAddressDetails, { loading, data, error }] = useLazyQuery(GET_ADDRESS_DETAILS, {
    variables: {
      network: "bitcoin",
      address,
      from: fromDate,
      till: tillDate,
    },
  });

  useEffect(() => {
    if (address && fromDate && tillDate) {
      fetchAddressDetails();
    }
  }, [address, fromDate, tillDate, fetchAddressDetails]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :( Please try again</p>;

  const inputsValue = data?.bitcoin.inputs[0]?.value || 0;
  const outputsValue = data?.bitcoin.outputs[0]?.value || 0;
  const balance = outputsValue - inputsValue;

  return (
    <div className={styles.container}>
    <h2 className={styles.title}>Address Details for <span className={styles.highlight}>{address}</span></h2>
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Metric</th>
          <th className={styles.th}>Value</th>
        </tr>
      </thead>
        <tbody>
          <tr><td>Inputs in Transactions</td><td>{data?.bitcoin.inputs[0]?.count || 0}</td></tr>
          <tr><td>Outputs in Transactions</td><td>{data?.bitcoin.outputs[0]?.count || 0}</td></tr>
          <tr><td>First Transaction Date</td><td>{data?.bitcoin.inputs[0]?.min_date || 'N/A'}</td></tr>
          <tr><td>Last Transaction Date</td><td>{data?.bitcoin.outputs[0]?.max_date || 'N/A'}</td></tr>
          <tr><td>Received in Outputs</td><td className={styles.dollar}>${data?.bitcoin.outputs[0]?.value_usd.toLocaleString()}</td></tr>
          <tr><td>Spent in Inputs</td><td className={styles.dollar}>${data?.bitcoin.inputs[0]?.value_usd.toLocaleString()}</td></tr>
          <tr><td>Balance (Unspent Outputs)</td><td className={styles.dollar}>${balance.toLocaleString()}</td></tr>
        </tbody>
      </table>
    </div>
  );
}

export default AddressDetails;
