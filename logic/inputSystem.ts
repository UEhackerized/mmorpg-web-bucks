
import { InputAction } from '../types';

interface KeyBinding {
    key: string; 
    action: InputAction;
}

const DEFAULT_BINDINGS: KeyBinding[] = [
    { key: 'KeyW', action: 'MOVE_FORWARD' },
    { key: 'KeyS', action: 'MOVE_BACKWARD' },
    { key: 'KeyA', action: 'MOVE_LEFT' },
    { key: 'KeyD', action: 'MOVE_RIGHT' },
    { key: 'KeyQ', action: 'CAMERA_ROTATE_LEFT' },
    { key: 'KeyE', action: 'CAMERA_ROTATE_RIGHT' },
    { key: 'KeyR', action: 'CAMERA_ZOOM_IN' },
    { key: 'KeyF', action: 'CAMERA_ZOOM_OUT' },
    { key: 'Space', action: 'ATTACK_BASIC' },
    { key: 'Digit1', action: 'USE_QUICKSLOT_1' },
    { key: 'Digit2', action: 'USE_QUICKSLOT_2' },
    { key: 'Digit3', action: 'USE_QUICKSLOT_3' },
    { key: 'Digit4', action: 'USE_QUICKSLOT_4' },
    { key: 'KeyI', action: 'TOGGLE_INVENTORY' },
    { key: 'KeyC', action: 'TOGGLE_CHARACTER_PANEL' },
    { key: 'KeyK', action: 'TOGGLE_SKILL_PANEL' },
    { key: 'KeyM', action: 'TOGGLE_MAP' },
    { key: 'KeyJ', action: 'TOGGLE_QUEST_LOG' },
    // F removed from here to allow Zoom Out. Z is sufficient.
    { key: 'KeyZ', action: 'INTERACT_OR_PICKUP' },
    { key: 'Escape', action: 'OPEN_MENU' },
    { key: 'Enter', action: 'OPEN_CHAT' },
];

type ActionCallback = () => void;

class InputSystem {
    private activeActions: Set<InputAction> = new Set();
    private listeners: Map<InputAction, Set<ActionCallback>> = new Map();
    public joystickVector = { x: 0, y: 0 };

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupListeners();
        }
    }

    private setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.repeat && !this.isMovementKey(e.code)) return;
            const binding = DEFAULT_BINDINGS.find(b => b.key === e.code || b.key === e.key);
            if (binding) {
                const activeElement = document.activeElement;
                if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
                    if (binding.action !== 'OPEN_CHAT' && binding.action !== 'OPEN_MENU') return;
                }
                this.activeActions.add(binding.action);
                this.triggerAction(binding.action);
            }
        });

        window.addEventListener('keyup', (e) => {
            const binding = DEFAULT_BINDINGS.find(b => b.key === e.code || b.key === e.key);
            if (binding) this.activeActions.delete(binding.action);
        });

        // FIX: Karakterin takılı kalmasını önler
        window.addEventListener('blur', () => {
            this.activeActions.clear();
            this.joystickVector = { x: 0, y: 0 };
        });
    }

    private isMovementKey(code: string): boolean {
        // Added R and F to prevent repeat stutter if desired, though technically not movement
        return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE', 'KeyR', 'KeyF'].includes(code);
    }

    public isActionActive(action: InputAction): boolean {
        return this.activeActions.has(action);
    }

    public setActionActive(action: InputAction, active: boolean) {
        if (active) {
            this.activeActions.add(action);
            this.triggerAction(action);
        } else {
            this.activeActions.delete(action);
        }
    }

    public onAction(action: InputAction, callback: ActionCallback) {
        if (!this.listeners.has(action)) this.listeners.set(action, new Set());
        this.listeners.get(action)?.add(callback);
        return () => this.listeners.get(action)?.delete(callback);
    }

    private triggerAction(action: InputAction) {
        this.listeners.get(action)?.forEach(cb => cb());
    }
}

export const inputSystem = new InputSystem();
