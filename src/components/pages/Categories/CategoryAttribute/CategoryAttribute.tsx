"use client";
import React, { useEffect, useRef } from "react";
import { Checkbox, Dropdown, Label } from "flowbite-react";
import { useAttributesStore } from "@/store/store";
import { CategoryAttribute } from "@/shared/types";

type CategoryAttributeType = {
  onAttributesChange: (attributeIds: string[]) => void;
  initialAttributes?: CategoryAttribute[];
};

const CategoryAttribute: React.FC<CategoryAttributeType> = ({
  onAttributesChange,
  initialAttributes,
}) => {
  const activeCategoryAttributeIds = useRef<string[]>([]);

  const addActiveCategoryAttribute = (attributeId: string) => {
    activeCategoryAttributeIds.current.push(attributeId);
    onAttributesChange(activeCategoryAttributeIds.current);
  };

  const removeActiveCategoryAttribute = (attributeId: string) => {
    const index = activeCategoryAttributeIds.current.indexOf(attributeId);

    if (index !== -1) {
      activeCategoryAttributeIds.current.splice(index, 1);
      onAttributesChange(activeCategoryAttributeIds.current);
    }
  };

  const { Item } = Dropdown;
  const { allAttributes, fetchAllAttributes } = useAttributesStore();

  const handleInputChange = (e: { target: { checked: any; id: any } }) => {
    const { checked, id } = e.target;

    if (checked) {
      addActiveCategoryAttribute(id);
    } else {
      removeActiveCategoryAttribute(id);
    }
  };

  useEffect(() => {
    if (allAttributes.length !== 0) return;
    fetchAllAttributes();
  }, [allAttributes, fetchAllAttributes]);

  useEffect(() => {
    if (initialAttributes && initialAttributes.length > 0) {
      initialAttributes.forEach((initAttribute) => {
        activeCategoryAttributeIds.current.push(initAttribute.attribute.id);
      });
    }
  }, [initialAttributes]);

  return (
    <div className="w-full">
      <div className="mb-2 block">
        <Label
          htmlFor="categoryAttributes"
          value="Choose Category Attributes"
        />
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
