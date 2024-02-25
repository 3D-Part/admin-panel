import { URLPartsEnum } from '@/shared/enums'

import { PaginationData, ProductData, ProductFormBody } from '@/shared/types'
import { useProductsStore } from '@/store/store'
import { Avatar, Dropdown, Table } from 'flowbite-react'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { HiDotsVertical } from 'react-icons/hi'
import { toast } from 'react-toastify'

type TableItemType = {
    product: ProductData
    onWarningModalOpen: (product: ProductData) => void
}

const S3_URL = process.env.S3_URL

export const TableItem: React.FC<TableItemType> = ({
    product,
    onWarningModalOpen,
}) => {
    const [activeImageId, setActiveImageId] = useState('')
    const { name, category, manufacturer, sku, price, quantity, images } =
        product

    const router = useRouter()

    const {
        changeActiveProduct,
        addNewProducts,
        currentPage,
        itemsPerPage,
        fetchProducts,
    } = useProductsStore()

    // Make this function global
    const fetchProductsData = async () => {
        const paginationData: PaginationData = {
            offset: (currentPage - 1) * itemsPerPage,
            limit: itemsPerPage,
        }
        await fetchProducts(paginationData)
    }

    const duplicateProduct = async () => {
        const _body: ProductFormBody = { ...product }

        _body.name = _body.name + ' copy'

        if (!product.manufacturer) {
            delete _body.manufacturerId
        }
        if (!product.description) {
            delete _body.description
        }
        if (!product.details) {
            delete _body.details
        }

        const request = await addNewProducts(_body)
        if (request) {
            toast(`${product.name} is copied!`, {
                hideProgressBar: true,
                autoClose: 2000,
                type: 'success',
            })

            fetchProductsData()
        }
    }

    const editProduct = () => {
        changeActiveProduct(product)
        router.push(URLPartsEnum.EditProduct)
    }

    useEffect(() => {
        if (images.length === 0) return

        const mainImage = images.find((image) => image.isMain)
        const _activeImageId = mainImage ? mainImage.imageId : images[0].imageId
        setActiveImageId(`${S3_URL}/${_activeImageId}`)
    }, [images])

    return (
        <>
            <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell
                    onClick={editProduct}
                    className="cursor-pointer whitespace-nowrap font-medium text-gray-900 dark:text-white"
                >
                    <div className="flex justify-start items-center gap-6">
                        <Avatar
                            alt="product"
                            placeholderInitials="3D"
                            img={activeImageId}
                            size="md"
                            rounded
                            className="custom_avatar_img "
                        />
                        {name}
                    </div>
                </Table.Cell>
                <Table.Cell>{category ? category.name : '/'}</Table.Cell>
                <Table.Cell>{manufacturer ? manufacturer.name : ''}</Table.Cell>
                <Table.Cell>{sku}</Table.Cell>
                <Table.Cell>{price}KM</Table.Cell>
                <Table.Cell>{quantity}</Table.Cell>
                <Table.Cell>
                    <div className="flex justify-end items-center gap-8">
                        <Dropdown
                            inline
                            arrowIcon={false}
                            label={<HiDotsVertical />}
                        >
                            <Dropdown.Item onClick={editProduct}>
                                <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
                                    <p>Edit</p>
                                </span>
                            </Dropdown.Item>
                            <Dropdown.Item onClick={duplicateProduct}>
                                <span className="font-medium text-cyan-600 cursor-pointer hover:underline dark:text-cyan-500">
                                    <p>Duplicate</p>
                                </span>
                            </Dropdown.Item>
                            <Dropdown.Item
                                onClick={() => onWarningModalOpen(product)}
                            >
                                <span className="font-medium text-red-500 cursor-pointer hover:underline dark:text-red-500">
                                    <p>Remove</p>
                                </span>
                            </Dropdown.Item>
                        </Dropdown>
                    </div>
                </Table.Cell>
            </Table.Row>
        </>
    )
}
