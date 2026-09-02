import React from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components';

const OrderDetail = () => {
  const { id } = useParams();

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-4xl font-display text-forest">Order Detail - ID: {id}</h1>
      </div>
    </PageWrapper>
  );
};

export default OrderDetail;
