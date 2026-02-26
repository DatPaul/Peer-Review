// src/pages/PendingApprovalPage.jsx
import React from 'react';
import Card from '../components/common/Card.jsx';

const PendingApprovalPage = () => {
  return (
    <div className="max-w-2xl mx-auto mt-16 text-center">
      <Card>
        <h1 className="text-2xl font-bold text-gray-800">Account Pending Approval</h1>
        <p className="mt-4 text-gray-600">
          Contul dumneavoastră trebuie să fie validat de un administrator. Vă rugăm așteptați validarea.
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Veți primi o notificare pe email odată ce contul este activat.
        </p>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;