
import { InputAction } from '../types';

interface KeyBinding {
    key: string; // KeyboardEvent.code or KeyboardEvent.key
    action: InputAction;
}

// Metin2 Default Mappings
const DEFAULT_BINDINGS: KeyBinding[] = [
    { key: 'KeyW', action: 'MOVE_FORWARD' },
    { key: 'KeyS', action: 'MOVE_BACKWARD' },
    { key: 'KeyA', action: 'MOVE_LEFT' },
    { key: 'KeyD', action: 'MOVE_RIGHT' },
    
    { key: 'KeyQ', action: 'CAMERA_ROTATE_LEFT' },
    { key: 'KeyE', action: 'CAMERA_ROTATE_RIGHT' },

    { key: 'Space', action: 'ATTACK_BASIC' },

    { key: 'Digit1', action: 'USE_QUICKSLOT_1' },
    { key: 'Digit2', action: 'USE_QUICKSLOT_2' },
    { key: 'Digit3', action: 'USE_QUICKSLOT_3' },
    { key: 'Digit4', action: 'USE_QUICKSLOT_4' },
    { key: 'Digit5', action: 'USE_QUICKSLOT_5' },

    { key: 'F1', action: 'SWITCH_QUICKSLOT_BAR_1' },
    { key: 'F2', action: 'SWITCH_QUICKSLOT_BAR_2' },
    { key: 'F3', action: 'SWITCH_QUICKSLOT_BAR_3' },
    { key: 'F4', action: 'SWITCH_QUICKSLOT_BAR_4' },

    { key: 'KeyI', action: 'TOGGLE_INVENTORY' },
    { key: 'KeyC', action: 'TOGGLE_CHARACTER_PANEL' },
    { key: 'KeyK', action: 'TOGGLE_SKILL_PANEL' },
    { key: 'KeyM', action: 'TOGGLE_MAP' },
    { key: 'KeyJ', action: 'TOGGLE_QUEST_LOG' },

    { key: 'KeyF', action: 'INTERACT_OR_PICKUP' },
    { key: 'KeyZ', action: 'INTERACT_OR_PICKUP' }, // Alternative common in private servers

    { key: 'Escape', action: 'OPEN_MENU' },
    { key: 'Enter', action: 'OPEN_CHAT' },
];

type ActionCallback = () => void;

class InputSystem {
    private activeActions: Set<InputAction> = new Set();
    private listeners: Map<InputAction, Set<ActionCallback>> = new Map();

    constructor() {
        this.setupListeners();
    }

    private setupListeners() {
        window.addEventListener('keydown', (e) => {
            // Ignore repeated keys for toggles, but keep for movement
            if (e.repeat && !this.isMovementKey(e.code)) return;
            
            const binding = DEFAULT_BINDINGS.find(b => b.key === e.code || b.key === e.key);
            if (binding) {
                // If chatting, ignore game keys except Enter/Esc
                const activeElement = document.activeElement;
                const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement;
                
                if (isTyping) {
                    if (binding.action === 'OPEN_CHAT' || binding.action === 'OPEN_MENU') {
                        // Allow these
                    } else {
                        return; 
                    }
                }

                this.activeActions.add(binding.action);
                this.triggerAction(binding.action);
            }
        });

        window.addEventListener('keyup', (e) => {
            const binding = DEFAULT_BINDINGS.find(b => b.key === e.code || b.key === e.key);
            if (binding) {
                this.activeActions.delete(binding.action);
            }
        });

        // Mouse Listeners could go here for Left Click Attack
    }

    private isMovementKey(code: string): boolean {
        return ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'].includes(code);
    }

    // Check if an action is currently held down (e.g., movement)
    public isActionActive(action: InputAction): boolean {
        return this.activeActions.has(action);
    }

    // Register a callback for a one-time trigger (e.g., toggle UI, cast skill)
    public onAction(action: InputAction, callback: ActionCallback) {
        if (!this.listeners.has(action)) {
            this.listeners.set(action, new Set());
        }
        this.listeners.get(action)?.add(callback);
        return () => {
            this.listeners.get(action)?.delete(callback);
        };
    }

    private triggerAction(action: InputAction) {
        const callbacks = this.listeners.get(action);
        if (callbacks) {
            callbacks.forEach(cb => cb());
        }
    }
}

export const inputSystem = new InputSystem();
