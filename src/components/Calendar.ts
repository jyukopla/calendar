import { CSSProperties, Component, ReactChild, createElement } from "react";

import { Alert } from "./Alert";
import { Container, Style } from "../utils/namespaces";
import * as classNames from "classnames";
import * as BigCalendar from "react-big-calendar";
import * as moment from "moment";
import * as withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import CustomToolbar from "./Toolbar";
import { SizeContainer } from "./SizeContainer";

import { CalendarLoader } from "./CalendarLoader";

import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../ui/Calendar.scss";
import "../ui/CalendarLoader.scss";

const localizer = BigCalendar.momentLocalizer(moment);
export const DragAndDropCalendar = withDragAndDrop(BigCalendar);

export interface CalendarProps {
    alertMessage?: ReactChild;
    className?: string;
    events: CalendarEvent[];
    color?: string;
    formats?: {};
    enableCreate: boolean;
    height: number;
    heightUnit: Style.HeightUnitType;
    defaultView: Style.View;
    loading?: boolean;
    startPosition?: Date;
    messages: {};
    popup: boolean;
    editable: string;
    titleFormat?: (date: Date) => void;
    weekdayFormat?: (date: Date) => void;
    timeGutterFormat?: (date: Date) => void;
    monthHeaderFormat?: (date: Date) => void;
    dayHeaderFormat?: (date: Date) => void;
    style: CSSProperties;
    viewOption: "custom" | "standard";
    width: number;
    widthUnit: Style.WidthUnitType;
    onRangeChangeAction?: (date: object) => void;
    onSelectEventAction?: (eventInfo: object) => void;
    onEventResizeAction?: (eventInfo: object) => void;
    onSelectSlotAction?: (slotInfo: object) => void;
    onEventDropAction?: (eventInfo: object) => void;
    customViews: Container.CustomViews[];
}

interface HOCToolbarProps {
    customViews: Container.CustomViews[] | Partial<Container.ButtonConfig>[];
    onClickToolbarButton: (date: object) => void;
}

export interface CalendarEvent {
    allDay: boolean;
    color: string;
    end: Date;
    guid: string;
    start: Date;
    title: string;
}

class Calendar extends Component<CalendarProps> {

    render() {
        return createElement(SizeContainer,
            {
                className: classNames("widget-calendar", this.props.className),
                style: this.props.style,
                widthUnit: this.props.widthUnit,
                width: this.props.width,
                heightUnit: this.props.heightUnit,
                height: this.props.height
            },
            this.renderAlert(),
            this.renderCalendar()
        );
    }

    private getDefaultToolbar(): Partial<Container.ButtonConfig>[] {
        return [
            {
                customView: "previous",
                position: "left",
                buttonToolTip: "previous"
            },
            {
                customView: "today",
                position: "left",
                customCaption: "today"
            },
            {
                customView: "next",
                position: "left",
                buttonToolTip: "next"
            },
            {
                customView: "title",
                position: "center"
            },
            {
                customView: "day",
                position: "right",
                customCaption: "day"
            },
            {
                customView: "week",
                position: "right",
                customCaption: "week"
            },
            {
                customView: "month",
                position: "right",
                customCaption: "month"
            }
        ];
    }

    private renderAlert() {
        return createElement(Alert, { className: "widget-calendar-alert" }, this.props.alertMessage);
    }

    private renderCalendar() {
        const wrapToolbar = (injectedProps: HOCToolbarProps) =>
            (toolbarProps: Container.ToolbarProps) => createElement(CustomToolbar as any, { ...injectedProps, ...toolbarProps });

        const props = {
            localizer: localizer,
            events: this.props.events,
            allDayAccessor: this.allDayAccessor,
            components: { toolbar: wrapToolbar({ customViews: this.getToolbarProps(), onClickToolbarButton: this.onRangeChange }) },
            eventPropGetter: this.eventColor,
            defaultDate: this.props.startPosition,
            defaultView: this.defaultView(),
            formats: this.props.viewOption === "custom" ? this.props.formats : "",
            messages: this.props.viewOption === "custom" ? this.props.messages : "",
            popup: this.props.popup,
            selectable: this.props.enableCreate,
            step: 30,
            min: moment('06:00am', 'h:mma').toDate(),
            max: moment('09:00pm', 'h:mma').toDate(),
            showMultiDayTimes: true,
            onRangeChange: this.onRangeChange,
            onSelectEvent: this.onSelectEvent,
            onSelectSlot: this.onSelectSlot,
            views: [ "month", "day", "week", "work_week", "month", "agenda" ]
        };

        if (this.props.loading) {
            return createElement(CalendarLoader);
        } else if (this.props.enableCreate && this.props.editable === "default") {
            return createElement(DragAndDropCalendar, {
                ...props,
                onEventDrop: this.onEventDrop,
                onEventResize: this.onEventResize
            });
        } else {
            return createElement(BigCalendar, props);
        }
    }

    private defaultView() {
        if (this.props.viewOption === "standard" && (this.props.defaultView === "work_week" || this.props.defaultView === "agenda")) {
            return "month";
        }

        return this.props.defaultView;
    }

    private getToolbarProps(): Partial<Container.ButtonConfig>[] {
        const toolbarProps = this.props.viewOption === "standard"
            ? this.getDefaultToolbar()
            : this.props.customViews;

        return toolbarProps.map(customView => ({ ...customView, onClickToolbarButton: this.onRangeChange }));
    }

    private allDayAccessor = (event: Container.ViewOptions) => event.allDay;

    private eventColor = (events: CalendarEvent) => ({ style: { backgroundColor: events.color } });

    private onRangeChange = (date: object) => {
        if (this.props.onRangeChangeAction && date) {
            this.props.onRangeChangeAction(date);
        }
    }

    private onEventDrop = (eventInfo: Container.EventInfo) => {
        if ((eventInfo.start !== eventInfo.event.start || eventInfo.end !== eventInfo.event.end) && this.props.editable && this.props.onEventDropAction) {
            this.props.onEventDropAction(eventInfo);
        }
    }

    private onEventResize = (eventInfo: Container.EventInfo) => {
        if ((eventInfo.start !== eventInfo.event.start || eventInfo.end !== eventInfo.event.end) && this.props.editable && this.props.onEventResizeAction) {
            this.props.onEventResizeAction(eventInfo);
        }
    }

    private onSelectEvent = (eventInfo: object) => {
        if (this.props.onSelectEventAction) { this.props.onSelectEventAction(eventInfo); }
    }

    private onSelectSlot = (slotInfo: object) => {
        if (this.props.onSelectSlotAction) { this.props.onSelectSlotAction(slotInfo); }
    }
}

export { Calendar as Calendar, Calendar as MyCalendar };
