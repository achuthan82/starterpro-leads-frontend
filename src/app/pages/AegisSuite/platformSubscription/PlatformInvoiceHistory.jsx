// import React from 'react';

import {
    Button, Card, Pagination, PaginationItems, PaginationNext, PaginationPrevious, Spinner
} from 'components/ui';
import {
    Table, TBody, Td, Th, THead, Tr,
} from 'components/ui/Table';
import { useEffect, useState } from 'react';
import { invoiceService } from 'utils/apiService';
import moment from 'moment';

const InvoiceHistory = ({navigate}) => {
    const [invoiceList, setInvoiceList] = useState([])
    console.log(invoiceList)
    const [pagination, setPagination] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)

    const fetchInvoiceList = (page, per_page) => {
        invoiceService.getInvoicePlatformHistory(page, per_page).then((response) => {
            if (response.data.status === 200) {
                setInvoiceList(response.data.data)
                setPagination(response.data.pagination)
            } else if (response.data.staus === 204) {
                setInvoiceList([])
                setPagination(null)
            } else {
                setInvoiceList([])
                setPagination(null)
            }
        }).catch(() => {
        }).finally(() => {

        })
    }
    const handlePage = (val) => {
        setCurrentPage(val)
        fetchInvoiceList(val, 10)
    }
  const download = () => {
  setLoading(true);

  invoiceService.getInvoicePlatformHistory(1, pagination.total)
    .then((response) => {
      if (response.data.status === 200) {
        const invoices = response.data.data;

        // Keep only required fields
        const filteredData = invoices.map(item => ({
          id: item.id,
          date: new Date(item.created_at).toLocaleDateString('en-US'),
          amount: item.amount_received
        }));

        const headers = ['invoice', 'date', 'amount'];

        // Convert to CSV
        const rows = filteredData.map(row =>
          headers.map(field => JSON.stringify(row[field])).join(',')
        );

        const csvContent = [headers.join(','), ...rows].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'invoices.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    })
    .finally(() => {
      setLoading(false);
    });
};

    useEffect(() => {
        fetchInvoiceList(1, 10)
    }, [])

    return (
        <>
        {invoiceList && invoiceList.length > 0 ? (
        <Card>
            <div className="p-6 bg-white shieldnest-shadow overflow-hidden rounded-xl dark:bg-gray-800">
                <div className="flex justify-between items-center mb-4 px-5">
                    <h2 className="text-2xl font-bold dark:text-gray-100">Invoice History</h2>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-gray-100">
                        <Button variant="solid" onClick={download} disabled={!pagination || pagination?.total < 1 || loading}>{!loading ? 'Download All' : <Spinner/> }</Button>
                    </div>
                </div>

                <Table className="w-full text-left">
                    <THead className='border-b-1'>
                        <Tr>
                            <Th>Invoice ID</Th>
                            <Th>Date</Th>
                            <Th>Amount</Th>
                            {/* <Th>Status</Th> */}
                            {/* <Th>States</Th> */}
                            {/* <Th>Actions</Th> */}
                        </Tr>
                    </THead>
                    <TBody className="text-left">
                        {invoiceList?.map((invoice) => (
                            <Tr key={invoice.id}>
                                <Td className="font-medium">{invoice.id}</Td>
                                <Td>{moment(invoice.created_at).format('MMM DD, YYYY')}</Td>
                                <Td>${invoice.amount_received}</Td>
                                {/* <Td className='text-center'>
                                    {invoice.payment_status === 'paid' && <Tag className="bg-green-100 text-green-800 p-2">Paid</Tag>}
                                    {invoice.payment_status === 'processing' && <Tag className="bg-yellow-100 text-yellow-800 p-2">Processing</Tag>}
                                </Td> */}
                                <Td className='flex justify-center'>
                                    <div className="flex items-center gap-1 text-blue-600">
                                        <Button variant="link" size="sm" onClick={() => {navigate(`/platform-subscriptions/invoice/${invoice.id}?from=0`)}}>View</Button>
                                    </div>
                                </Td>
                            </Tr>
                        ))}
                    </TBody>
                </Table>
                <div className="flex justify-center items-center mt-6">
                    {
                        pagination && <div className="max-w-xl">
                            <Pagination total={Math.ceil((pagination.total / 10))} value={currentPage} onChange={(val) => handlePage(val)}>
                                <PaginationPrevious />
                                <PaginationItems />
                                <PaginationNext />
                            </Pagination>
                        </div>
                    }

                </div>
            </div>
        </Card>
        ) : (
            <div className="text-center p-0 rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Invoice Found</h3>
                <p className="mt-2 mb-0 text-sm text-gray-500">
                    You do not have any invoices.
                </p>
            </div>
        )}
        </>
    );
};

export default InvoiceHistory; 