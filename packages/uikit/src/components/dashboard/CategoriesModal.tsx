import { Notification, NotificationFooter } from '../Notification';
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { ListBlock, ListItemElement, ListItemPayload } from '../List';
import { ReorderIcon } from '../Icon';
import styled from 'styled-components';
import { Body1 } from '../Text';
import { Checkbox } from '../fields/Checkbox';
import {
    DashboardColumnsForm,
    useDashboardColumnsAsForm,
    useDashboardColumnsForm
} from '../../hooks/dashboard/useDashboardColumns';
import { Button } from '../fields/Button';
import { DashboardColumn } from '../../hooks/dashboard/dashboard-column';

export const CategoriesModal: FC<{ isOpen: boolean; onClose: () => void }> = ({
    isOpen,
    onClose
}) => {
    const [_, { mutate, isLoading }] = useDashboardColumnsForm();
    const { data } = useDashboardColumnsAsForm();
    const [categoriesForm, setCategoriesForm] = useState<DashboardColumnsForm>([]);

    useEffect(() => {
        if (data) {
            setCategoriesForm(data);
        }
    }, [data]);

    const child = useCallback(
        () => (
            <CategoriesModalContent
                categories={data || []}
                categoriesForm={categoriesForm}
                setCategoriesForm={setCategoriesForm}
            />
        ),
        [categoriesForm, setCategoriesForm]
    );

    const onSave = () => {
        mutate(categoriesForm, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const formHasChanged = useMemo(() => {
        return JSON.stringify(data) !== JSON.stringify(categoriesForm);
    }, [categoriesForm, data]);

    return (
        <Notification
            title="Dashboard metrics"
            isOpen={isOpen}
            handleClose={onClose}
            footer={
                <NotificationFooter>
                    <Button
                        size="large"
                        primary
                        fullWidth
                        type="button"
                        loading={isLoading}
                        disabled={isLoading || !formHasChanged}
                        onClick={onSave}
                    >
                        Save
                    </Button>
                </NotificationFooter>
            }
        >
            {child}
        </Notification>
    );
};

const CategoriesModalContent: FC<{
    categories: DashboardColumn[];
    categoriesForm: DashboardColumnsForm;
    setCategoriesForm: (
        data: DashboardColumnsForm | ((data: DashboardColumnsForm) => DashboardColumnsForm)
    ) => void;
}> = ({ categories, categoriesForm, setCategoriesForm }) => {
    const handleDrop: OnDragEndResponder = useCallback(droppedItem => {
        const destination = droppedItem.destination;
        if (!destination) return;

        setCategoriesForm(_categories => {
            const updatedList = [..._categories];
            const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
            updatedList.splice(destination.index, 0, reorderedItem);
            return updatedList;
        });
    }, []);

    const onCheckboxChange = (categoryId: string, checked: boolean) => {
        setCategoriesForm(form =>
            form.map(c => (c.id === categoryId ? { ...c, isEnabled: checked } : c))
        );
    };
    return (
        <DragDropContext onDragEnd={handleDrop}>
            <Droppable direction="vertical" droppableId="wallets">
                {provided => (
                    <ListBlock {...provided.droppableProps} ref={provided.innerRef}>
                        {categoriesForm.map(({ id, isEnabled }, index) => (
                            <Draggable key={id} draggableId={id} index={index}>
                                {(p, snapshotDrag) => {
                                    let transform = p.draggableProps.style?.transform;

                                    if (snapshotDrag.isDragging && transform) {
                                        transform = transform.replace(/\(.+\,/, '(0,');
                                    }

                                    const style = {
                                        ...p.draggableProps.style,
                                        transform
                                    };

                                    return (
                                        <ListItemElement
                                            ios={true}
                                            hover={false}
                                            ref={p.innerRef}
                                            {...p.draggableProps}
                                            style={style}
                                        >
                                            <ListItemPayload>
                                                <Row>
                                                    <Icon {...p.dragHandleProps}>
                                                        <ReorderIcon />
                                                    </Icon>
                                                    <Body1>
                                                        {categories.find(c => c.id === id)?.name}
                                                    </Body1>
                                                    <CheckboxStyled
                                                        checked={isEnabled}
                                                        onChange={value =>
                                                            onCheckboxChange(id, value)
                                                        }
                                                    />
                                                </Row>
                                            </ListItemPayload>
                                        </ListItemElement>
                                    );
                                }}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </ListBlock>
                )}
            </Droppable>
        </DragDropContext>
    );
};

const Icon = styled.span`
    display: flex;
    color: ${props => props.theme.iconSecondary};
`;

const Row = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;

    width: 100%;
`;

const CheckboxStyled = styled(Checkbox)`
    margin-left: auto;
`;
