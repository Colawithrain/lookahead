import moment from "moment";
import $ from "jquery";

// Converter class (SubjectClass -> FullCalendar Event Object)
export const classToEvent = (subjects, cls) => {
  const calculateEventDate = (dayIndex, hours) => {
    const today = moment();
    const startOfWeek = today.startOf("isoWeek");
    return startOfWeek.add(dayIndex, "days").add(hours, "hours");
  };
  let {
    day,
    start,
    finish,
    description,
    subjectCode,
    locations,
    type,
    streamNumber,
    codes
  } = cls;
  start = calculateEventDate(day, start).toDate();
  finish = calculateEventDate(day, finish).toDate();
  const locked = type === "Mandatory" ? false : true;
  return {
    title: description,
    backgroundColor: subjects[subjectCode].color,
    locations: locations.length,
    type,
    codes,
    streamNumber,
    code: subjectCode,
    subjectName: subjects[subjectCode].name,
    className: "lookahead-event-wrapper",
    start: start,
    end: finish,
    editable: locked,
    durationEditable: false
  };
};

/**
 * Handles when an event has started to be dragged
 * Main actions: make regular events {REGULAR_EVENTS_OPACITY}% visible, show
 * relevant (allowed) background events
 * @param {[Event]} allEvents
 * @param {Event} currentEvent
 */
const REGULAR_EVENTS_OPACITY = 0.25;
let currentBackgroundEvents = [];
export const handleEventDragStart = (allEvents, currentEvent) => {
  // Get all foreground events
  const regularEvents = allEvents.filter(e => e.rendering !== "background");
  // Make them opaque
  regularEvents.forEach(event => {
    $(`.${event.className}`).css("opacity", REGULAR_EVENTS_OPACITY);
  });
  // Get all allowed drop events
  const backgroundEvents = allEvents.filter(
    e =>
      e.rendering === "background" &&
      e.title === currentEvent.title &&
      e.code === currentEvent.extendedProps.code
  );
  console.log(backgroundEvents);
  // Track the currently shown background events
  currentBackgroundEvents = backgroundEvents;
  // Show all allowed background events
  backgroundEvents.forEach(showBackgroundEvent);
};

export const handleEventAllow = (dropLocation, draggedEvent) => {
  const intersects = currentBackgroundEvents.filter(event => {
    const sameDay = dropLocation.start.getDay() === event.start.getDay();
    const sameHour = dropLocation.start.getHours() === event.start.getHours();
    const sameMinutes =
      dropLocation.start.getMinutes() === event.start.getMinutes();
    return sameDay && sameHour && sameMinutes;
  });
  const onAClass = intersects.length > 0;
  if (onAClass) {
    return true;
  } else {
    return false;
  }
};

/**
 * Handles when an event is stopped being dragged.
 * Main actions: make regular events 100% visible, hide all background events
 * @param {[Event]} allEvents
 * @param {Event} currentEvent
 */
export const handleEventDragStop = (allEvents, currentEvent) => {
  // Get all foreground events
  const regularEvents = allEvents.filter(e => e.rendering !== "background");
  regularEvents.forEach(event => {
    $(`.${event.className}`).css("opacity", 1);
  });
  // Get all allowed drop events
  const backgroundEvents = allEvents.filter(
    e =>
      e.rendering === "background" &&
      e.title === currentEvent.title &&
      e.code === currentEvent.extendedProps.code
  );
  // Hide all allowed background events
  backgroundEvents.forEach(hideBackgroundEvent);
  currentBackgroundEvents = [];
};

export const handleEventDrop = ({ event, oldEvent }) => {
  console.log(event, oldEvent);
};

const BACKGROUND_EVENT_COLOR = "orange";
const showBackgroundEvent = event => {
  const className = event.className;
  $(`.${className}`).css("background-color", BACKGROUND_EVENT_COLOR);
  //   $(`.${className}`).removeClass("hide");
  //   $(`.${className}`).addClass("show");
};

const hideBackgroundEvent = event => {
  const className = event.className;
  $(`.${className}`).css("background-color", "transparent");
  //   $(`.${className}`).showClass("hide");
  //   $(`.${className}`).removeClass("show");
};

export const generateBackgroundEvents = subjects => {
  const bgEvents = [];
  // Loop through each subject, generating background events for them 1-by-1
  for (const [code, { data }] of Object.entries(subjects)) {
    // Check if the data for the subject has been retrieved yet
    if (!data) {
      // If not, continue to the next subject
      continue;
    }
    // Helper function to generate unique class names for each background event
    const generateClassName = ({ subjectCode, description }) =>
      `lookahead-background-${subjectCode}-${description}`.replace(" ", "");
    // Generate bg events for Variable classes
    for (const cls of data._regularClasses) {
      const event = {
        ...classToEvent(subjects, cls),
        className: generateClassName(cls),
        backgroundColor: "transparent",
        rendering: "background"
      };
      bgEvents.push(event);
    }
    // Generate bg events for streams
    for (const { streams } of Object.values(data._streamContainers)) {
      for (const { classes } of streams) {
        for (const cls of classes) {
          const event = {
            ...classToEvent(subjects, cls),
            className: generateClassName(cls),
            backgroundColor: "transparent",
            rendering: "background"
          };
          bgEvents.push(event);
        }
      }
    }
  }
  return bgEvents;
};
