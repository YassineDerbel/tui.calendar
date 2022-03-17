import { h } from 'preact';

import { Layout } from '@src/components/layout';
import { useStore } from '@src/contexts/calendarStore';
import { useTheme } from '@src/contexts/theme';
import CalendarControl from '@src/factory/calendarControl';
import { getWeekDates } from '@src/helpers/grid';
import { act, screen } from '@src/test/utils';
import TZDate from '@src/time/date';
import { addDate, isSameDate, subtractDate } from '@src/time/datetime';

function cleanup() {
  document.body.innerHTML = '';
}

function MockComponent() {
  const events = useStore((state) => state.calendar.events.toArray());

  return events.length > 0 ? (
    <div>
      {events.map((event) => (
        <div key={event.id}>event</div>
      ))}
    </div>
  ) : (
    <div>There is no events</div>
  );
}

class MockCalendar extends CalendarControl {
  protected getComponent() {
    return <MockComponent />;
  }
}
let mockCalendar: MockCalendar;

describe('changeView/getViewName', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendar = new MockCalendar(container);
    act(() => {
      mockCalendar.render();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should return current view name', () => {
    // Given

    // When

    // Then
    expect(mockCalendar.getViewName()).toBe('month'); // Initial view is 'month'
  });

  it('should change current view to week', () => {
    // Given

    // When
    mockCalendar.changeView('week');

    // Then
    expect(mockCalendar.getViewName()).toBe('week');
  });

  it('should change current view to day', () => {
    // Given

    // When
    mockCalendar.changeView('day');

    // Then
    expect(mockCalendar.getViewName()).toBe('day');
  });
});

// @TODO: Add more test cases for multiple events
describe('createEvents', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendar = new MockCalendar(container);
  });

  afterEach(() => {
    cleanup();
  });

  it('should render 1 event', () => {
    // Given
    act(() => {
      mockCalendar.render();
    });
    act(() => {
      mockCalendar.createEvents([
        {
          id: '1',
          calendarId: '1',
          title: 'my event',
          category: 'time',
          dueDateClass: '',
          start: '2018-01-18T22:30:00+09:00',
          end: '2018-01-19T02:30:00+09:00',
        },
      ]);
    });

    // When

    // Then
    expect(screen.queryByText('event')).toBeInTheDocument();
  });
});

describe('clear', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendar = new MockCalendar(container);
  });

  afterEach(() => {
    cleanup();
  });

  it('should clear events', () => {
    // Given
    act(() => {
      mockCalendar.render();
    });
    act(() => {
      mockCalendar.createEvents([
        {
          id: '1',
          calendarId: '1',
          title: 'my event',
          category: 'time',
          dueDateClass: '',
          start: '2018-01-18T22:30:00+09:00',
          end: '2018-01-19T02:30:00+09:00',
        },
      ]);
    });
    expect(screen.queryByText('event')).toBeInTheDocument();

    // When
    act(() => {
      mockCalendar.clear();
    });

    // Then
    expect(screen.queryByText('There is no events')).toBeInTheDocument();
  });
});

describe('destroy', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendar = new MockCalendar(container);
    act(() => {
      mockCalendar.render();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should remove all calendar properties', () => {
    // Given
    const properties = Object.keys(mockCalendar) as (keyof MockCalendar)[];

    // When
    act(() => {
      mockCalendar.destroy();
    });

    // Then
    expect(container.innerHTML).toMatchInlineSnapshot(`""`);
    properties.forEach((property) => {
      expect(mockCalendar[property]).toBeUndefined();
    });
  });
});

describe('openFormPopup', () => {
  class MockPopupCalendar extends CalendarControl {
    protected getComponent() {
      return <Layout>mock</Layout>; // popup component is rendered in Layout component
    }
  }

  let mockPopupCalendar: MockPopupCalendar;

  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mockPopupCalendar = new MockPopupCalendar(container);
    act(() => {
      mockPopupCalendar.render();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should open form popup', () => {
    // Given
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // When
    act(() => {
      mockPopupCalendar.openFormPopup({ title: 'my event' });
    });

    // Then
    expect(screen.queryByRole('dialog')).toBeInTheDocument();
  });
});

describe('setDate/getDate', () => {
  beforeEach(() => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendar = new MockCalendar(container);
  });

  afterEach(() => {
    cleanup();
  });

  it('should get current renderDate', () => {
    // Given
    const today = new TZDate();

    // When

    // Then
    expect(isSameDate(mockCalendar.getDate(), today)).toBe(true);
  });

  it('should set renderDate when param is TZDate', () => {
    // Given
    const today = new TZDate();
    const targetDate = addDate(today, 1);

    // When
    act(() => {
      mockCalendar.setDate(targetDate);
    });

    // Then
    expect(mockCalendar.getDate()).toEqual(targetDate);
  });

  it('should set renderDate when param is string', () => {
    // Given
    const targetDate = '2022-03-15';
    const expected = new TZDate(targetDate);

    // When
    act(() => {
      mockCalendar.setDate(targetDate);
    });

    // Then
    expect(mockCalendar.getDate()).toEqual(expected);
  });

  it('should set renderDate when param is number', () => {
    // Given
    const targetDate = 1647314395599; // 2022-03-15
    const expected = new TZDate(targetDate);

    // When
    act(() => {
      mockCalendar.setDate(targetDate);
    });

    // Then
    expect(mockCalendar.getDate()).toEqual(expected);
  });

  it('should set renderDate when param is Date', () => {
    // Given
    const targetDate = new Date('2022-03-15');
    const expected = new TZDate(targetDate);

    // When
    act(() => {
      mockCalendar.setDate(targetDate);
    });

    // Then
    expect(mockCalendar.getDate()).toEqual(expected);
  });
});

describe('prev/next/today', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    cleanup();
  });

  describe('month view', () => {
    function MockMonthView() {
      const { renderDate } = useStore((state) => state.view);
      const month = renderDate.getMonth();

      return <div>month: {month}</div>;
    }
    class MockCalendarMonth extends CalendarControl {
      protected getComponent() {
        return <MockMonthView />;
      }
    }

    let mockCalendarMonth: MockCalendarMonth;
    const MONTHS_IN_YEAR = 12;

    beforeEach(() => {
      mockCalendarMonth = new MockCalendarMonth(container);
      act(() => {
        mockCalendarMonth.render();
      });
    });

    it('should render this month by default', () => {
      // Given
      const today = new TZDate();
      const thisMonth = today.getMonth();

      // When

      // Then
      expect(screen.queryByText(`month: ${thisMonth}`)).toBeInTheDocument();
    });

    it('should render next month when next is called', () => {
      // Given
      const today = new TZDate();
      const thisMonth = today.getMonth();
      const nextMonth = (thisMonth + 1) % MONTHS_IN_YEAR; // 0 ~ 11
      expect(screen.queryByText(`month: ${thisMonth}`)).toBeInTheDocument();

      // When
      act(() => {
        mockCalendarMonth.next();
      });

      // Then
      expect(screen.queryByText(`month: ${thisMonth}`)).not.toBeInTheDocument();
      expect(screen.queryByText(`month: ${nextMonth}`)).toBeInTheDocument();
    });

    it('should render prev month when prev is called', () => {
      // Given
      const today = new TZDate();
      const thisMonth = today.getMonth();
      const prevMonth = (thisMonth - 1 + MONTHS_IN_YEAR) % MONTHS_IN_YEAR; // 0 ~ 11
      expect(screen.queryByText(`month: ${thisMonth}`)).toBeInTheDocument();

      // When
      act(() => {
        mockCalendarMonth.prev();
      });

      // Then
      expect(screen.queryByText(`month: ${thisMonth}`)).not.toBeInTheDocument();
      expect(screen.queryByText(`month: ${prevMonth}`)).toBeInTheDocument();
    });

    it(`should render today's month when today is called`, () => {
      // Given
      const today = new TZDate();
      const thisMonth = today.getMonth();
      act(() => {
        mockCalendarMonth.next();
      });
      expect(screen.queryByText(`month: ${thisMonth}`)).not.toBeInTheDocument();

      // When
      act(() => {
        mockCalendarMonth.today();
      });

      // Then
      expect(screen.queryByText(`month: ${thisMonth}`)).toBeInTheDocument();
    });
  });

  describe('week view', () => {
    const defaultWeekOptions = { startDayOfWeek: 0, workweek: false };
    function MockWeekView() {
      const { renderDate } = useStore((state) => state.view);
      const weekDates = getWeekDates(renderDate, defaultWeekOptions);

      return (
        <div>
          {weekDates.map((weekDate) => (
            <div key={weekDate.getDate()}>date: {weekDate.getDate()}</div>
          ))}
        </div>
      );
    }
    class MockCalendarWeek extends CalendarControl {
      protected getComponent() {
        return <MockWeekView />;
      }
    }

    let mockCalendarWeek: MockCalendarWeek;

    beforeEach(() => {
      mockCalendarWeek = new MockCalendarWeek(container);
      act(() => {
        mockCalendarWeek.changeView('week');
        mockCalendarWeek.render();
      });
    });

    it('should render this week by default', () => {
      // Given
      const today = new TZDate();
      const weekDates = getWeekDates(today, defaultWeekOptions);
      const dates = weekDates.map((weekDate) => weekDate.getDate());

      // When

      // Then
      dates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });
    });

    it('should render next week when next is called', () => {
      // Given
      const today = new TZDate();
      const thisWeekDates = getWeekDates(today, defaultWeekOptions);
      const nextWeekDates = getWeekDates(addDate(today, 7), defaultWeekOptions);

      const thisDates = thisWeekDates.map((weekDate) => weekDate.getDate());
      const nextDates = nextWeekDates.map((weekDate) => weekDate.getDate());

      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });

      // When
      act(() => {
        mockCalendarWeek.next();
      });

      // Then
      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).not.toBeInTheDocument();
      });
      nextDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });
    });

    it('should render prev week when prev is called', () => {
      // Given
      const today = new TZDate();
      const thisWeekDates = getWeekDates(today, defaultWeekOptions);
      const prevWeekDates = getWeekDates(subtractDate(today, 7), defaultWeekOptions);

      const thisDates = thisWeekDates.map((weekDate) => weekDate.getDate());
      const prevDates = prevWeekDates.map((weekDate) => weekDate.getDate());

      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });

      // When
      act(() => {
        mockCalendarWeek.prev();
      });

      // Then
      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).not.toBeInTheDocument();
      });
      prevDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });
    });

    it('should render this week when today is called', () => {
      // Given
      const today = new TZDate();
      const thisWeekDates = getWeekDates(today, defaultWeekOptions);
      const thisDates = thisWeekDates.map((weekDate) => weekDate.getDate());

      act(() => {
        mockCalendarWeek.next();
      });
      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).not.toBeInTheDocument();
      });

      // When
      act(() => {
        mockCalendarWeek.today();
      });

      // Then
      thisDates.forEach((date) => {
        expect(screen.queryByText(`date: ${date}`)).toBeInTheDocument();
      });
    });
  });

  describe('day view', () => {
    function MockDayView() {
      const { renderDate } = useStore((state) => state.view);

      return (
        <div>
          <div>date: {renderDate.getDate()}</div>
        </div>
      );
    }
    class MockCalendarDay extends CalendarControl {
      protected getComponent() {
        return <MockDayView />;
      }
    }

    let mockCalendarDay: MockCalendarDay;

    beforeEach(() => {
      mockCalendarDay = new MockCalendarDay(container);
      act(() => {
        mockCalendarDay.changeView('day');
        mockCalendarDay.render();
      });
    });

    it('should render today by default', () => {
      // Given
      const today = new TZDate();

      // When

      // Then
      expect(screen.queryByText(`date: ${today.getDate()}`)).toBeInTheDocument();
    });

    it('should render tomorrow when next is called', () => {
      // Given
      const today = new TZDate();
      const tomorrow = addDate(today, 1);

      expect(screen.queryByText(`date: ${today.getDate()}`)).toBeInTheDocument();

      // When
      act(() => {
        mockCalendarDay.next();
      });

      // Then
      expect(screen.queryByText(`date: ${today.getDate()}`)).not.toBeInTheDocument();
      expect(screen.queryByText(`date: ${tomorrow.getDate()}`)).toBeInTheDocument();
    });

    it('should render yesterday when prev is called', () => {
      // Given
      const today = new TZDate();
      const yesterday = subtractDate(today, 1);

      expect(screen.queryByText(`date: ${today.getDate()}`)).toBeInTheDocument();

      // When
      act(() => {
        mockCalendarDay.prev();
      });

      // Then
      expect(screen.queryByText(`date: ${today.getDate()}`)).not.toBeInTheDocument();
      expect(screen.queryByText(`date: ${yesterday.getDate()}`)).toBeInTheDocument();
    });

    it('should render today when today is called', () => {
      // Given
      const today = new TZDate();

      act(() => {
        mockCalendarDay.next();
      });
      expect(screen.queryByText(`date: ${today.getDate()}`)).not.toBeInTheDocument();

      // When
      act(() => {
        mockCalendarDay.today();
      });

      // Then
      expect(screen.queryByText(`date: ${today.getDate()}`)).toBeInTheDocument();
    });
  });
});

describe('setTheme', () => {
  function MockThemeView() {
    const { common, week, month } = useTheme();
    const {
      gridSelection: { backgroundColor },
    } = common;
    const {
      currentTime: { color },
    } = week;
    const {
      moreView: { boxShadow },
    } = month;

    return (
      <div>
        <div>gridSelection: {backgroundColor}</div>
        <div>currentTime: {color}</div>
        <div>moreView: {boxShadow}</div>
      </div>
    );
  }
  class MockCalendarTheme extends CalendarControl {
    protected getComponent() {
      return <MockThemeView />;
    }
  }

  let container: HTMLDivElement;
  let mockCalendarTheme: MockCalendarTheme;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    mockCalendarTheme = new MockCalendarTheme(container);
    act(() => {
      mockCalendarTheme.render();
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('should change theme value', () => {
    // Given
    const gridSelectionBackgroundColor = '#ff0000';
    const currentTimeColor = '#00ff00';
    const moreViewBoxShadow = '0 0 10px #0000ff';

    expect(
      screen.queryByText(`gridSelection: ${gridSelectionBackgroundColor}`)
    ).not.toBeInTheDocument();
    expect(screen.queryByText(`currentTime: ${currentTimeColor}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`moreView: ${moreViewBoxShadow}`)).not.toBeInTheDocument();

    // When
    act(() => {
      mockCalendarTheme.setTheme({
        'common.gridSelection.backgroundColor': gridSelectionBackgroundColor,
        'week.currentTime.color': currentTimeColor,
        'month.moreView.boxShadow': moreViewBoxShadow,
      });
    });

    // Then
    expect(
      screen.queryByText(`gridSelection: ${gridSelectionBackgroundColor}`)
    ).toBeInTheDocument();
    expect(screen.queryByText(`currentTime: ${currentTimeColor}`)).toBeInTheDocument();
    expect(screen.queryByText(`moreView: ${moreViewBoxShadow}`)).toBeInTheDocument();
  });
});
