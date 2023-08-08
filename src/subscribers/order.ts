import {
  EventBusService,
  FulfillmentStatus,
  OrderService,
  OrderStatus,
  PaymentStatus,
} from '@medusajs/medusa';
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

type InjectedDependencies = {
  eventBusService: EventBusService;
  orderService: OrderService;
};

class OrderSubscriber {
  protected readonly _orderService: OrderService;
  constructor({ eventBusService, orderService }: InjectedDependencies) {
    this._orderService = orderService;
    eventBusService.subscribe('order.placed', this.handleOrderPlaced);

    eventBusService.subscribe(
      'order.payment_captured',
      this.handlePaymentCaptured
    );
    eventBusService.subscribe(
      'order.shipment_created',
      this.handleShipmentCreated
    );

    eventBusService.subscribe('order.updated', this.handleOrderUpdated);
  }
  handleOrderUpdated = async (data: { id: string }) => {
    const order = await this._orderService.retrieve(data.id);
    if (
      order.status === OrderStatus.PENDING &&
      order.fulfillment_status === FulfillmentStatus.SHIPPED &&
      order.payment_status === PaymentStatus.CAPTURED
    ) {
      await this._orderService.completeOrder(data.id);
    }
  };
  handleShipmentCreated = async (data: { id: string }) => {
    const order = await this._orderService.retrieve(data.id);
    if (
      order.status === OrderStatus.PENDING &&
      order.fulfillment_status === FulfillmentStatus.SHIPPED &&
      order.payment_status === PaymentStatus.CAPTURED
    ) {
      await this._orderService.completeOrder(data.id);
    }
  };

  handlePaymentCaptured = async (data: { id: string }) => {
    const order = await this._orderService.retrieve(data.id);
    console.info(order);
    if (
      order.status === OrderStatus.PENDING &&
      order.fulfillment_status === FulfillmentStatus.SHIPPED
    ) {
      await this._orderService.completeOrder(data.id);
    }
  };
  handleOrderPlaced = async (data: { id: string }) => {
    const orderData = await this._orderService.retrieve(data.id, {
      relations: ['customer'],
    });
    await sgMail.send({
      templateId: process.env.SENDGRID_ORDER_PLACED_ID,
      from: process.env.SENDGRID_FROM,
      to: orderData.email,
      dynamicTemplateData: {
        ...orderData,
      },
    });
  };
}

export default OrderSubscriber;
