interface DraggedContext<T> {
  element: T;
  index: number;
  futureIndex: number;
}

interface RelatedContext<F> {
  element: F;
  index: number;
}

export interface VueDraggableEvent<F, T> {
  draggedContext: DraggedContext<T>;
  relatedContext: RelatedContext<F>;
}
