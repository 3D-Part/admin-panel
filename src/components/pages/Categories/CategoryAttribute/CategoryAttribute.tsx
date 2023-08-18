"use client";
import React, { useEffect, useRef, useState } from "react";
import { Checkbox, Dropdown, Label } from "flowbite-react";
import { useAttributesStore } from "@/store/store";
import { CategoryAttribute } from "@/shared/types";

type CategoryAttributeType = {
  onAttributesChange: (attributeIds: string[]) => void;
  initialAttributes?: CategoryAttribute[];
};

type ActiveAttributesType = {
  name: string;
  id: string;
};

const CategoryAttribute: React.FC<CategoryAttributeType> = ({
  onAttributesChange,
  initialAttributes,
}) => {
  // const activeCategoryAttributeIds = useRef<string[]>([]);

  const [activeAttributes, setActiveAttributes] = useState<
    ActiveAttributesType[]
  >([]);

  const addActiveCategoryAttribute = (id: string, name: string) => {
    const newAttribute = {
      id,
      name,
    };
    setActiveAttributes((prevAttributes) => [...prevAttributes, newAttribute]);
  };

  const removeActiveCategoryAttribute = (id: string, name: string) => {
    const attributeIndex = activeAttributes.findIndex(
      (attr) => attr.name === name
    );

    if (attributeIndex !== -1) {
      const updatedAttributes = activeAttributes.filter(
        (attr) => attr.id !== id
      );
      setActiveAttributes(updatedAttributes);
    }
  };

  const { Item } = Dropdown;
  const { allAttributes, fetchAllAttributes } = useAttributesStore();

  const handleInputChange = (e: {
    target: { checked: any; id: string; name: string };
  }) => {
    const { checked, id, name } = e.target;

    if (checked) {
      addActiveCategoryAttribute(id, name);
    } else {
      removeActiveCategoryAttribute(id, name);
    }
  };

  // TODO need to be cached
  // useEffect(() => {
  //   if (allAttributes.length !== 0) return;
  //   fetchAllAttributes();
  // }, [allAttributes, fetchAllAttributes]);
  useEffect(() => {
    fetchAllAttributes();
  }, []);

  useEffect(() => {
    const attributeIds = activeAttributes.map((attribute) => attribute.id);
    onAttributesChange(attributeIds);
  }, [activeAttributes, onAttributesChange]);

  useEffect(() => {
    if (initialAttributes && initialAttributes.length > 0) {
      const _activeAttributes: ActiveAttributesType[] = [];
      initialAttributes.forEach((initAttribute) => {
        const attribute = {
          id: initAttribute.attribute.id,
          name: initAttribute.attribute.name,
        };
        _activeAttributes.push(attribute);
        setActiveAttributes(_activeAttributes);
      });
    }
  }, [initialAttributes]);

  return (
    <div className="w-full">
      <div className="mb-2 flex gap-2">
        <Label htmlFor="categoryAttributes" value="Category Attributes" />
        {activeAttributes.length > 0 && (
          <div className="text-sm font-medium text-gray-900 dark:text-gray-300 flex flex-wrap gap-1">
            (
            {activeAttributes.map((attribute, index) => {
              return (
                <span key={attribute.id}>
                  {index > 0 ? "," : ""} {attribute.name}
                </span>
              );
            })}
            )
          </div>
        )}
      </div>
      <Dropdown dismissOnClick={false} label="Attributes">
        {allAttributes.map((attribute) => {
          const checked = initialAttributes?.some(
            (initAttribute) => initAttribute.attribute.id === attribute.id
          );

          return (
            <Item key={attribute.id}>
              <div className="flex items-center gap-2">
                <Checkbox
                  name={attribute.name}
                  defaultChecked={checked}
                  onChange={handleInputChange}
                  id={attribute.id}
                />
                <Label htmlFor="at1">{attribute.name}</Label>
              </div>
            </Item>
          );
        })}
      </Dropdown>
    </div>
  );
};

export default CategoryAttribute;
