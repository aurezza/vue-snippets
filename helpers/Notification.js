export const urls = ({ model, type }) => {
  const url = {
    contact: '/dashboard/profile?id=',
    opportunity: '/dashboard/opportunities/opportunity?id=',
    todo: '/dashboard/todos/',
    project: '/dashboard/projects/',
    order: `/dashboard/sales/${type === 'credit_note' ? 'credit-note' : type === 'sales_order' ? 'invoice' : 'quote'}/item/?id=`,
    task: '/dashboard/projects/',
    inquiry: '/dashboard/inquiries/inquiry?id=',
  };

  const modelUrl = url[model];

  return modelUrl;
};

export const tabKeys = (key) => {
  const tabs = {
    note: 'notes',
    task: 'task-expenses',
    form: 'forms',
    'system-form': 'system-forms',
    email: 'emails',
    product: 'products',
    order: 'orders',
    time: 'time',
    attachment: 'attachment'
  };

  // defaulting to task tab for now; depending on new module, change this to accept null
  const tabKey = tabs[key] || tabs.task;
  return tabKey;
};

export const getRouterObject = ({ model, type, resource_id, tab }) => {
  const url = urls({ model, type });

  const methods = {
    byQueryParam: {
      path: `${url}${resource_id}`,
      query: { tab, redirect: true }
    },
    byRouteParam: {
      name: `${url.replace(/\//g, '-').substr(1)}id-${tabKeys(tab)}`,
      params: { id: resource_id, redirect: true },
    },
  };

  switch (model) {
    case 'contact':
    case 'opportunity':
    case 'todo':
    case 'order':
    case 'inquiry':
      return methods.byQueryParam;
    default:
      return methods.byRouteParam;
  }
};


export const test = {};