export const CSS = `
.np-root{
  --np-font:'Microsoft YaHei UI','Microsoft YaHei','Segoe UI',sans-serif;
  --np-mono:ui-monospace,'Cascadia Mono','Consolas','SFMono-Regular',monospace;
  --np-bg:#fbfbfd;
  --np-panel:#ffffff;
  --np-panel-2:#f3f5f9;
  --np-panel-3:#e9edf5;
  --np-text:#1f2328;
  --np-text-2:#5d6673;
  --np-text-3:#8b95a5;
  --np-border:#dfe4ed;
  --np-border-strong:#c9d1de;
  --np-accent:#3b6fe0;
  --np-accent-soft:#e8efff;
  --np-accent-text:#ffffff;
  --np-danger:#c9372c;
  --np-danger-soft:#fdecea;
  --np-success:#1f7a4d;
  --np-success-soft:#e8f6ee;
  --np-warn:#9a6700;
  --np-warn-soft:#fff4d6;
  --np-gutter:#f3f5f9;
  --np-selection:#c7dcff;
  --np-shadow:0 18px 50px rgba(24,35,58,.18);
  --np-radius:10px;
  color:var(--np-text);
  background:var(--np-bg);
  font-family:'Segoe UI','Microsoft YaHei UI','Microsoft YaHei',sans-serif;
  font-size:13px;
  line-height:1.45;
  height:100%;
  min-height:0;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  color-scheme:light;
}
.np-root[data-theme="dark"]{
  --np-bg:#1d1f23;
  --np-panel:#24262b;
  --np-panel-2:#2b2e34;
  --np-panel-3:#343841;
  --np-text:#e7e9ee;
  --np-text-2:#aeb5c2;
  --np-text-3:#808999;
  --np-border:#363a43;
  --np-border-strong:#4a4f5b;
  --np-accent:#7aa2ff;
  --np-accent-soft:#26375c;
  --np-accent-text:#0f1420;
  --np-danger:#ff8a80;
  --np-danger-soft:#3b2324;
  --np-success:#67d99a;
  --np-success-soft:#1e352a;
  --np-warn:#e9c46a;
  --np-warn-soft:#3a3220;
  --np-gutter:#202227;
  --np-selection:#31527c;
  --np-shadow:0 18px 50px rgba(0,0,0,.5);
  color-scheme:dark;
}
@media (prefers-color-scheme: dark){
  .np-root[data-theme="system"]{
    --np-bg:#1d1f23;
    --np-panel:#24262b;
    --np-panel-2:#2b2e34;
    --np-panel-3:#343841;
    --np-text:#e7e9ee;
    --np-text-2:#aeb5c2;
    --np-text-3:#808999;
    --np-border:#363a43;
    --np-border-strong:#4a4f5b;
    --np-accent:#7aa2ff;
    --np-accent-soft:#26375c;
    --np-accent-text:#0f1420;
    --np-danger:#ff8a80;
    --np-danger-soft:#3b2324;
    --np-success:#67d99a;
    --np-success-soft:#1e352a;
    --np-warn:#e9c46a;
    --np-warn-soft:#3a3220;
    --np-gutter:#202227;
    --np-selection:#31527c;
    --np-shadow:0 18px 50px rgba(0,0,0,.5);
    color-scheme:dark;
  }
}
.np-root *{box-sizing:border-box}
.np-root button,.np-root input,.np-root textarea,.np-root select{font:inherit;color:inherit}
.np-root button{cursor:pointer}

.np-topbar{display:flex;align-items:center;gap:8px;padding:7px 10px;border-bottom:1px solid var(--np-border);background:var(--np-panel);flex:none;min-height:44px}
.np-brand{display:flex;align-items:center;gap:7px;font-weight:650;letter-spacing:.1px;color:var(--np-text);white-space:nowrap;margin-right:2px}
.np-brand svg{flex:none}
.np-brand small{font-weight:500;color:var(--np-text-3);font-size:11px;margin-left:2px}
.np-top-actions{display:flex;align-items:center;gap:4px;margin-left:auto;min-width:0}
.np-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;border:1px solid transparent;background:transparent;color:var(--np-text-2);border-radius:7px;padding:5px 8px;line-height:1.2;min-height:28px;white-space:nowrap}
.np-btn:hover{background:var(--np-panel-2);color:var(--np-text)}
.np-btn:disabled{opacity:.5;cursor:default}
.np-btn.np-primary{background:var(--np-accent);color:var(--np-accent-text);border-color:transparent}
.np-btn.np-primary:hover{filter:brightness(1.05);background:var(--np-accent)}
.np-btn.np-outline{border-color:var(--np-border-strong);background:var(--np-panel)}
.np-btn.np-danger{color:var(--np-danger)}
.np-btn.np-icon{width:28px;padding:0}
.np-btn.np-sm{min-height:24px;padding:3px 7px;font-size:12px}
.np-btn.np-active{background:var(--np-accent-soft);color:var(--np-accent)}
.np-menu-wrap{position:relative}
.np-menu{position:absolute;z-index:60;top:calc(100% + 4px);left:0;min-width:210px;background:var(--np-panel);border:1px solid var(--np-border);border-radius:9px;box-shadow:var(--np-shadow);padding:5px;display:flex;flex-direction:column;gap:1px}
.np-menu.right{left:auto;right:0}
.np-menu-item{appearance:none;border:0;background:transparent;text-align:left;border-radius:6px;padding:7px 9px;display:flex;align-items:center;gap:8px;color:var(--np-text)}
.np-menu-item:hover{background:var(--np-panel-2)}
.np-menu-item .np-kbd{margin-left:auto;color:var(--np-text-3);font-size:11px}
.np-menu-sep{height:1px;background:var(--np-border);margin:4px 0}
.np-kbd{font-family:var(--np-mono);font-size:11px;padding:1px 5px;border-radius:4px;border:1px solid var(--np-border);background:var(--np-panel-2);color:var(--np-text-2)}
.np-tabs{display:flex;align-items:stretch;gap:1px;overflow-x:auto;background:var(--np-panel-2);border-bottom:1px solid var(--np-border);flex:none;min-height:34px;scrollbar-width:thin}
.np-tab{display:flex;align-items:center;gap:7px;max-width:260px;min-width:120px;padding:5px 8px 5px 11px;color:var(--np-text-2);border-right:1px solid var(--np-border);position:relative;flex:none;cursor:default;user-select:none}
.np-tab:hover{background:var(--np-panel-3)}
.np-tab.active{background:var(--np-panel);color:var(--np-text)}
.np-tab.active:after{content:'';position:absolute;left:0;right:0;top:0;height:2px;background:var(--np-accent)}
.np-tab-name{font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.np-tab-dot{width:7px;height:7px;border-radius:50%;background:var(--np-accent);flex:none}
.np-tab-close{appearance:none;border:0;background:transparent;color:var(--np-text-3);border-radius:4px;width:18px;height:18px;display:grid;place-items:center;padding:0;flex:none}
.np-tab-close:hover{background:var(--np-panel-3);color:var(--np-text)}
.np-tab-add{appearance:none;border:0;background:transparent;color:var(--np-text-2);width:34px;flex:none;font-size:18px;line-height:1}
.np-tab-add:hover{background:var(--np-panel-3);color:var(--np-text)}

.np-main{display:flex;flex:1;min-height:0;min-width:0;position:relative;background:var(--np-bg)}
.np-editor-col{display:flex;flex-direction:column;flex:1;min-width:0;min-height:0;position:relative}
.np-editor-wrap{flex:1;min-height:0;position:relative;background:var(--np-bg);overflow:hidden}
.np-editor-host{position:absolute;inset:0;overflow:hidden}
.np-editor-host .cm-editor{height:100%;background:var(--np-bg);color:var(--np-text);font-family:var(--np-font);font-size:var(--np-font-size,15px);line-height:var(--np-line-height,1.65);font-weight:var(--np-editor-weight,400)}
.np-editor-host .cm-scroller{font-family:var(--np-font);line-height:var(--np-line-height,1.65);overflow:auto}
.np-editor-host .cm-content{padding:16px 0 60px;caret-color:var(--np-accent)}
.np-editor-host .cm-line{padding:0 20px 0 12px;line-height:var(--np-line-height,1.65)}
.np-editor-host .cm-gutters{background:var(--np-gutter);color:var(--np-text-3);border-right:1px solid var(--np-border);font-family:var(--np-mono);font-size:11.5px}
.np-editor-host .cm-activeLineGutter{background:var(--np-panel-3);color:var(--np-text)}
.np-editor-host .cm-activeLine{background:color-mix(in srgb,var(--np-panel-2) 55%,transparent)}
.np-editor-host .cm-selectionBackground,.np-editor-host .cm-content ::selection{background:var(--np-selection)!important}
.np-editor-host .cm-cursor{border-left-color:var(--np-accent)}
.np-editor-host .cm-search{background:var(--np-panel);border:1px solid var(--np-border);border-radius:8px;box-shadow:var(--np-shadow);padding:8px 9px;font-family:'Segoe UI','Microsoft YaHei UI',sans-serif;font-size:12px;color:var(--np-text);top:8px;right:14px;display:flex;flex-wrap:wrap;gap:5px;align-items:center}
.np-editor-host .cm-search input{background:var(--np-bg);border:1px solid var(--np-border-strong);border-radius:5px;padding:3px 6px;color:var(--np-text);outline:none}
.np-editor-host .cm-search button{background:var(--np-panel-2);border:1px solid var(--np-border);border-radius:5px;padding:2px 6px;color:var(--np-text-2)}
.np-editor-host .cm-search label{color:var(--np-text-2)}
.np-editor-host .cm-panels{background:var(--np-panel);color:var(--np-text)}
.np-editor-host .cm-tooltip{background:var(--np-panel);border:1px solid var(--np-border);color:var(--np-text);box-shadow:var(--np-shadow)}
.np-editor-host .cm-placeholder{color:var(--np-text-3)}
.np-editor-host .cm-ann{background:color-mix(in srgb,var(--np-warn) 24%,transparent);border-bottom:1px dashed var(--np-warn)}
.np-preview{position:absolute;inset:0;overflow:auto;padding:28px clamp(20px,6%,80px) 80px;background:var(--np-bg);color:var(--np-text);font-family:var(--np-font);font-size:calc(var(--np-font-size,15px) * var(--np-preview-scale,1.05));line-height:var(--np-line-height,1.65);font-weight:var(--np-editor-weight,400);user-select:text}
.np-preview h1,.np-preview h2,.np-preview h3,.np-preview h4,.np-preview h5,.np-preview h6{line-height:1.3;margin:1.4em 0 .55em;font-weight:650}
.np-preview h1{font-size:1.9em;border-bottom:1px solid var(--np-border);padding-bottom:.35em}
.np-preview h2{font-size:1.5em;border-bottom:1px solid var(--np-border);padding-bottom:.25em}
.np-preview h3{font-size:1.25em}
.np-preview p{margin:.7em 0}
.np-preview a{color:var(--np-accent);text-decoration:none}
.np-preview a:hover{text-decoration:underline}
.np-preview code{font-family:var(--np-mono);font-size:.9em;background:var(--np-panel-2);border:1px solid var(--np-border);border-radius:4px;padding:.1em .3em}
.np-preview pre.np-md-code{background:var(--np-panel-2);border:1px solid var(--np-border);border-radius:8px;padding:12px 14px;overflow:auto;line-height:1.55}
.np-preview pre.np-md-code code{background:transparent;border:0;padding:0;font-size:.9em}
.np-preview blockquote{margin:.9em 0;padding:.1em 0 .1em 1em;border-left:3px solid var(--np-border-strong);color:var(--np-text-2)}
.np-preview ul,.np-preview ol{padding-left:1.6em;margin:.6em 0}
.np-preview li{margin:.2em 0}
.np-preview hr{border:0;border-top:1px solid var(--np-border-strong);margin:1.6em 0}
.np-preview img{max-width:100%;border-radius:6px}
.np-preview table{border-collapse:collapse;margin:1em 0;min-width:50%}
.np-preview th,.np-preview td{border:1px solid var(--np-border-strong);padding:6px 10px;text-align:left}
.np-preview th{background:var(--np-panel-2)}
.np-md-tablewrap{overflow:auto}
.np-md-empty{color:var(--np-text-3)}

.np-statusbar{display:flex;align-items:center;gap:12px;padding:0 12px;border-top:1px solid var(--np-border);background:var(--np-panel);color:var(--np-text-3);font-size:11.5px;min-height:25px;flex:none;white-space:nowrap;overflow:hidden}
.np-statusbar .np-grow{flex:1}
.np-status-item{display:inline-flex;align-items:center;gap:4px;overflow:hidden;text-overflow:ellipsis}
.np-status-item b{font-weight:500;color:var(--np-text-2)}
.np-status-path{max-width:44vw;overflow:hidden;text-overflow:ellipsis;color:var(--np-text-3);direction:rtl;text-align:left}
.np-badge{display:inline-flex;align-items:center;gap:4px;padding:1px 6px;border-radius:999px;background:var(--np-panel-2);color:var(--np-text-2);font-size:10.5px}
.np-badge.dirty{background:var(--np-warn-soft);color:var(--np-warn)}
.np-badge.ro{background:var(--np-danger-soft);color:var(--np-danger)}
.np-badge.saved{background:var(--np-success-soft);color:var(--np-success)}

.np-ai{width:326px;min-width:280px;max-width:38%;border-left:1px solid var(--np-border);background:var(--np-panel);display:flex;flex-direction:column;min-height:0;flex:none}
.np-ai-head{display:flex;align-items:center;gap:8px;padding:9px 12px;border-bottom:1px solid var(--np-border);flex:none}
.np-ai-title{font-weight:650;display:flex;align-items:center;gap:6px}
.np-ai-head .np-btn{margin-left:auto}
.np-ai-body{flex:1;overflow:auto;padding:11px 12px 18px;min-height:0}
.np-ai-section{margin-bottom:14px}
.np-ai-label{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--np-text-3);margin:0 0 6px;font-weight:600}
.np-selbox{border:1px solid var(--np-border);background:var(--np-panel-2);border-radius:8px;padding:8px 9px;color:var(--np-text-2);font-size:12px;max-height:108px;overflow:auto;white-space:pre-wrap;word-break:break-word}
.np-selbox.empty{color:var(--np-text-3);font-style:italic}
.np-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.np-action{border:1px solid var(--np-border);background:var(--np-panel);border-radius:7px;padding:7px 4px;font-size:12px;color:var(--np-text-2);text-align:center;min-height:32px}
.np-action:hover{border-color:var(--np-accent);color:var(--np-accent);background:var(--np-accent-soft)}
.np-action.active{border-color:var(--np-accent);color:var(--np-accent);background:var(--np-accent-soft)}
.np-textarea{width:100%;min-height:68px;resize:vertical;border:1px solid var(--np-border-strong);border-radius:7px;padding:7px 8px;background:var(--np-bg);outline:none;font-size:12.5px;line-height:1.5}
.np-textarea:focus{border-color:var(--np-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--np-accent) 20%,transparent)}
.np-input{width:100%;border:1px solid var(--np-border-strong);border-radius:7px;padding:6px 8px;background:var(--np-bg);outline:none;font-size:12.5px}
.np-input:focus{border-color:var(--np-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--np-accent) 20%,transparent)}
.np-row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.np-row.end{justify-content:flex-end}
.np-ai-footer{border-top:1px solid var(--np-border);padding:9px 12px;display:flex;gap:6px;align-items:center;flex:none;background:var(--np-panel)}
.np-ai-footer .np-btn{flex:1}
.np-hint{font-size:11px;color:var(--np-text-3);line-height:1.5;margin:6px 0 0}
.np-error{background:var(--np-danger-soft);color:var(--np-danger);border:1px solid color-mix(in srgb,var(--np-danger) 25%,transparent);padding:7px 8px;border-radius:7px;font-size:12px;white-space:pre-wrap;margin-top:8px}
.np-ann{border:1px solid var(--np-border);border-radius:8px;padding:7px 8px;margin-bottom:6px;background:var(--np-panel-2)}
.np-ann-top{display:flex;gap:6px;align-items:center;margin-bottom:4px}
.np-ann-quote{font-size:11.5px;color:var(--np-text-2);max-height:42px;overflow:hidden;white-space:pre-wrap;word-break:break-word;border-left:2px solid var(--np-warn);padding-left:6px;margin-bottom:4px}
.np-ann-note{font-size:12px;color:var(--np-text);white-space:pre-wrap;word-break:break-word}
.np-ann .np-btn{margin-left:auto}

.np-floatbar{position:absolute;z-index:30;background:var(--np-panel);border:1px solid var(--np-border);border-radius:8px;box-shadow:var(--np-shadow);display:flex;align-items:center;gap:2px;padding:3px;transform:translate(-50%,0)}
.np-floatbar .np-btn{min-height:26px;padding:3px 7px;font-size:11.5px}
.np-context{position:fixed;z-index:80;background:var(--np-panel);border:1px solid var(--np-border);border-radius:8px;box-shadow:var(--np-shadow);padding:4px;min-width:190px}
.np-empty{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;padding:36px;background:var(--np-bg)}
.np-emptybox{max-width:520px;text-align:center;color:var(--np-text-2)}
.np-emptybox .np-mark{width:74px;height:74px;border-radius:20px;background:var(--np-accent-soft);display:grid;place-items:center;margin:0 auto 18px;color:var(--np-accent)}
.np-emptybox h2{font-size:21px;margin:0 0 7px;color:var(--np-text);font-weight:650}
.np-emptybox p{font-size:13px;line-height:1.7;margin:0 auto 18px;max-width:430px;color:var(--np-text-2)}
.np-empty-actions{display:flex;gap:8px;justify-content:center;margin-bottom:20px}
.np-recent{text-align:left;border-top:1px solid var(--np-border);padding-top:12px;max-height:180px;overflow:auto}
.np-recent-title{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--np-text-3);margin-bottom:4px}
.np-recent-item{display:block;width:100%;text-align:left;border:0;background:transparent;padding:5px 6px;border-radius:5px;color:var(--np-text-2);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.np-recent-item:hover{background:var(--np-panel-2);color:var(--np-text)}
.np-drop{position:absolute;inset:10px;border:2px dashed var(--np-accent);background:color-mix(in srgb,var(--np-accent) 8%,transparent);border-radius:14px;display:grid;place-items:center;z-index:50;color:var(--np-accent);font-size:15px;font-weight:600;pointer-events:none}
.np-conflict{display:flex;align-items:center;gap:8px;padding:7px 12px;background:var(--np-warn-soft);color:var(--np-warn);border-bottom:1px solid color-mix(in srgb,var(--np-warn) 25%,transparent);font-size:12px;flex:none;flex-wrap:wrap}
.np-conflict .np-btn{color:var(--np-warn);border-color:color-mix(in srgb,var(--np-warn) 35%,transparent)}
.np-conflict .np-grow{flex:1}

.np-overlay{position:fixed;inset:0;z-index:100;background:rgba(15,20,30,.38);display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(2px)}
.np-modal{width:min(860px,94vw);max-height:90vh;background:var(--np-panel);color:var(--np-text);border:1px solid var(--np-border);border-radius:14px;box-shadow:var(--np-shadow);display:flex;flex-direction:column;overflow:hidden}
.np-modal.wide{width:min(1120px,96vw);height:90vh}
.np-modal.small{width:min(560px,94vw)}
.np-modal-head{display:flex;align-items:center;gap:9px;padding:12px 15px;border-bottom:1px solid var(--np-border);flex:none}
.np-modal-title{font-weight:650;font-size:14px}
.np-modal-head .np-btn{margin-left:auto}
.np-modal-body{padding:14px 16px;overflow:auto;min-height:0}
.np-modal-body.flush{padding:0}
.np-modal-foot{display:flex;align-items:center;gap:8px;padding:10px 15px;border-top:1px solid var(--np-border);flex:none;flex-wrap:wrap}
.np-modal-foot .np-grow{flex:1}
.np-diff-meta{display:flex;gap:10px;align-items:center;color:var(--np-text-2);font-size:12px;flex-wrap:wrap}
.np-diff-add{color:var(--np-success);font-weight:600}
.np-diff-del{color:var(--np-danger);font-weight:600}
.np-diff{font-family:var(--np-mono);font-size:12px;line-height:1.55;overflow:auto;max-height:calc(90vh - 150px);background:var(--np-bg)}
.np-diff-line{display:grid;grid-template-columns:48px 20px minmax(0,1fr);gap:0;border-bottom:1px solid color-mix(in srgb,var(--np-border) 45%,transparent)}
.np-diff-line .ln{color:var(--np-text-3);text-align:right;padding:1px 7px;user-select:none;background:var(--np-panel-2);border-right:1px solid var(--np-border)}
.np-diff-line .sign{text-align:center;color:var(--np-text-3);user-select:none}
.np-diff-line .txt{white-space:pre-wrap;word-break:break-word;padding:1px 9px}
.np-diff-line.add{background:var(--np-success-soft)}
.np-diff-line.add .txt{color:var(--np-success)}
.np-diff-line.del{background:var(--np-danger-soft)}
.np-diff-line.del .txt{color:var(--np-danger)}
.np-diff-line.gap{background:var(--np-panel-2);color:var(--np-text-3);grid-template-columns:48px 20px minmax(0,1fr)}
.np-diff-scope{display:inline-flex;align-items:center;gap:5px;padding:2px 7px;border-radius:999px;background:var(--np-accent-soft);color:var(--np-accent);font-size:11px}

.np-settings{display:flex;flex-direction:column;gap:14px}
.np-field{display:grid;grid-template-columns:150px minmax(0,1fr);gap:10px;align-items:center}
.np-field label{color:var(--np-text-2);font-size:12.5px}
.np-field .np-input,.np-field .np-textarea{max-width:100%}
.np-field-col{display:flex;flex-direction:column;gap:5px}
.np-field-col label{color:var(--np-text-2);font-size:12.5px}
.np-switch{display:inline-flex;align-items:center;gap:7px;color:var(--np-text-2);font-size:12.5px;cursor:pointer}
.np-switch input{width:15px;height:15px;accent-color:var(--np-accent)}
.np-seg{display:inline-flex;border:1px solid var(--np-border-strong);border-radius:7px;overflow:hidden}
.np-seg button{border:0;background:var(--np-panel);padding:5px 10px;color:var(--np-text-2);font-size:12px;border-right:1px solid var(--np-border)}
.np-seg button:last-child{border-right:0}
.np-seg button.active{background:var(--np-accent-soft);color:var(--np-accent)}
.np-range{display:flex;align-items:center;gap:8px}
.np-range input[type=range]{flex:1;accent-color:var(--np-accent)}
.np-range output{font-family:var(--np-mono);font-size:11px;color:var(--np-text-2);min-width:38px;text-align:right}
.np-settings-note{font-size:11.5px;line-height:1.6;color:var(--np-text-3);margin:0}
.np-assoc-status{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--np-border);border-radius:8px;background:var(--np-panel-2);font-size:12px;flex-wrap:wrap}
.np-ext-list{display:flex;flex-wrap:wrap;gap:5px;max-height:150px;overflow:auto;padding:2px}
.np-ext{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--np-border);border-radius:999px;padding:2px 7px;font-size:11px;color:var(--np-text-2);background:var(--np-panel)}
.np-ext.default{border-color:var(--np-success);color:var(--np-success);background:var(--np-success-soft)}
.np-toast{position:fixed;z-index:140;right:18px;bottom:34px;max-width:min(460px,80vw);background:var(--np-panel);color:var(--np-text);border:1px solid var(--np-border);border-left:3px solid var(--np-accent);border-radius:8px;box-shadow:var(--np-shadow);padding:9px 12px;font-size:12.5px;line-height:1.5;white-space:pre-wrap;animation:np-in .16s ease-out}
.np-toast.error{border-left-color:var(--np-danger)}
.np-toast.warn{border-left-color:var(--np-warn)}
.np-toast.success{border-left-color:var(--np-success)}
@keyframes np-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}
.np-spin{width:14px;height:14px;border:2px solid color-mix(in srgb,var(--np-accent) 25%,transparent);border-top-color:var(--np-accent);border-radius:50%;animation:np-spin .8s linear infinite;display:inline-block}
@keyframes np-spin{to{transform:rotate(360deg)}}
.np-loadingbar{height:2px;background:linear-gradient(90deg,transparent,var(--np-accent),transparent);background-size:40% 100%;animation:np-loading 1.2s linear infinite;flex:none}
@keyframes np-loading{from{background-position:-40% 0}to{background-position:140% 0}}
.np-fatal{max-width:720px;margin:48px auto;padding:20px;border:1px solid var(--np-danger);border-radius:12px;background:var(--np-danger-soft);color:var(--np-text);display:flex;flex-direction:column;gap:10px}
.np-fatal h2{margin:0;font-size:17px;color:var(--np-danger)}
.np-fatal p{margin:0;color:var(--np-text-2);line-height:1.6}
.np-fatal pre{max-height:280px;overflow:auto;background:var(--np-panel);border:1px solid var(--np-border);border-radius:7px;padding:10px;font-family:var(--np-mono);font-size:11px;white-space:pre-wrap}
.np-fatal .np-btn{align-self:flex-start}
.np-settings-page{padding:18px 20px;max-width:860px}
.np-settings-page h2{font-size:16px;margin:0 0 4px}
.np-settings-page p{font-size:12px;color:var(--np-text-3);margin:0 0 14px}
.np-settings-page .np-root{height:auto;min-height:0;background:transparent}
.np-hidden{display:none!important}
@media (max-width:920px){
  .np-ai{width:290px;min-width:250px}
  .np-brand small{display:none}
}
@media (max-width:720px){
  .np-ai{position:absolute;right:0;top:0;bottom:0;z-index:40;width:min(330px,92%);box-shadow:var(--np-shadow)}
  .np-top-actions .np-label{display:none}
  .np-status-path{max-width:30vw}
  .np-field{grid-template-columns:1fr;gap:5px}
}

/* ===== V2 visual refresh: calmer surfaces, stronger hierarchy, richer controls ===== */
.np-root{
  --np-accent-2:#7c5cff;
  --np-accent-gradient:linear-gradient(135deg,var(--np-accent) 0%,var(--np-accent-2) 100%);
  --np-soft-shadow:0 1px 2px rgba(23,34,56,.05),0 8px 24px rgba(23,34,56,.06);
  --np-radius-lg:14px;
}
.np-root[data-theme="dark"]{--np-accent-2:#a78bfa;--np-accent-gradient:linear-gradient(135deg,#6e97ff 0%,#b18cff 100%);--np-soft-shadow:0 1px 2px rgba(0,0,0,.2),0 12px 30px rgba(0,0,0,.22)}
@media (prefers-color-scheme: dark){
  .np-root[data-theme="system"]{--np-accent-2:#a78bfa;--np-accent-gradient:linear-gradient(135deg,#6e97ff 0%,#b18cff 100%);--np-soft-shadow:0 1px 2px rgba(0,0,0,.2),0 12px 30px rgba(0,0,0,.22)}
}
.np-root ::-webkit-scrollbar{width:10px;height:10px}
.np-root ::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--np-text-3) 40%,transparent);border:3px solid transparent;background-clip:padding-box;border-radius:999px}
.np-root ::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb,var(--np-text-3) 60%,transparent);border:3px solid transparent;background-clip:padding-box}
.np-topbar{
  min-height:52px;padding:8px 12px;gap:10px;
  background:linear-gradient(180deg,color-mix(in srgb,var(--np-panel) 92%,var(--np-accent) 8%),var(--np-panel));
  box-shadow:0 1px 0 var(--np-border);
}
.np-brand{gap:9px;margin-right:2px}
.np-brand-mark{width:33px;height:33px;border-radius:10px;display:grid;place-items:center;background:var(--np-accent-gradient);color:#fff;box-shadow:0 5px 14px color-mix(in srgb,var(--np-accent) 34%,transparent);flex:none}
.np-brand-text{display:flex;flex-direction:column;line-height:1.15;gap:1px}
.np-brand-text>span{font-size:14px;font-weight:700;letter-spacing:-.01em}
.np-brand-text>small{font-size:10px;color:var(--np-text-3);font-weight:500;letter-spacing:.04em;text-transform:uppercase}
.np-menu-cluster{display:flex;align-items:center;gap:1px;padding:2px;background:var(--np-panel-2);border:1px solid color-mix(in srgb,var(--np-border) 80%,transparent);border-radius:9px}
.np-menu-cluster .np-btn{min-height:26px;padding:4px 9px;font-size:12px}
.np-menu-cluster .np-btn.np-active{background:var(--np-panel);color:var(--np-text);box-shadow:0 1px 2px rgba(20,30,50,.08)}
.np-top-actions{gap:6px}
.np-top-divider{width:1px;height:20px;background:var(--np-border);margin:0 2px}
.np-btn{transition:background .15s ease,color .15s ease,border-color .15s ease,transform .15s ease,box-shadow .15s ease}
.np-btn.np-primary{background:var(--np-accent-gradient);color:#fff;box-shadow:0 4px 12px color-mix(in srgb,var(--np-accent) 26%,transparent)}
.np-btn.np-primary:hover{transform:translateY(-1px);box-shadow:0 6px 16px color-mix(in srgb,var(--np-accent) 34%,transparent);filter:none}
.np-btn.np-primary:active{transform:translateY(0)}
.np-save{padding:6px 12px;font-size:12px;font-weight:600;gap:6px;border-radius:8px}
.np-ai-toggle{border:1px solid var(--np-border);background:var(--np-panel);color:var(--np-text-2);padding:6px 9px;border-radius:8px}
.np-ai-toggle:hover{border-color:color-mix(in srgb,var(--np-accent) 35%,var(--np-border));color:var(--np-text)}
.np-ai-toggle.np-active{background:var(--np-accent-soft);border-color:color-mix(in srgb,var(--np-accent) 35%,var(--np-border));color:var(--np-accent)}
.np-ai-toggle.np-active svg{color:var(--np-accent-2)}
.np-tabs{padding:5px 8px 0;gap:4px;background:linear-gradient(180deg,var(--np-panel-2),color-mix(in srgb,var(--np-panel-2) 75%,var(--np-panel)));min-height:39px}
.np-tab{border:1px solid transparent;border-bottom:0;border-radius:9px 9px 0 0;padding:6px 8px 6px 11px;min-height:33px;max-width:280px;transition:background .15s ease,color .15s ease}
.np-tab:hover{background:color-mix(in srgb,var(--np-panel) 55%,transparent)}
.np-tab.active{background:var(--np-panel);border-color:var(--np-border);box-shadow:0 3px 10px rgba(20,30,50,.06)}
.np-tab.active:after{top:auto;bottom:-1px;height:2px;background:var(--np-accent-gradient);left:8px;right:8px;border-radius:2px}
.np-tab-close{opacity:.65}
.np-tab:hover .np-tab-close,.np-tab.active .np-tab-close{opacity:1}
.np-tab-add{align-self:center;width:30px;height:28px;border-radius:7px;margin-left:3px}
.np-editor-wrap{background:radial-gradient(120% 90% at 50% 0,color-mix(in srgb,var(--np-accent) 5%,var(--np-bg)) 0%,var(--np-bg) 52%)}
.np-editor-host .cm-content{padding-top:20px}
.np-editor-host .cm-line{padding:0 26px 0 14px}
.np-editor-host .cm-gutters{background:color-mix(in srgb,var(--np-gutter) 82%,transparent)}
.np-editor-host .cm-scroller{scroll-padding-bottom:70px}
.np-statusbar{min-height:28px;padding:0 14px;background:linear-gradient(180deg,var(--np-panel),color-mix(in srgb,var(--np-panel) 90%,var(--np-panel-2)));box-shadow:0 -1px 0 var(--np-border);gap:14px}
.np-zoom-stat{font-family:var(--np-mono);color:var(--np-accent);font-weight:600;letter-spacing:.01em}
.np-ai{width:342px;background:linear-gradient(180deg,color-mix(in srgb,var(--np-panel) 88%,var(--np-accent) 12%),var(--np-panel) 34%)}
.np-ai-head{padding:10px 12px;background:linear-gradient(180deg,color-mix(in srgb,var(--np-accent) 8%,transparent),transparent)}
.np-ai-title{gap:8px;font-size:13px}
.np-ai-title svg{color:var(--np-accent-2)}
.np-ai-body{padding:12px 12px 20px}
.np-ai-section{background:color-mix(in srgb,var(--np-panel) 82%,transparent);border:1px solid var(--np-border);border-radius:12px;padding:10px;margin-bottom:11px;box-shadow:0 1px 2px rgba(20,30,50,.03)}
.np-ai-section .np-ai-label{margin-bottom:8px}
.np-selbox{background:var(--np-bg);border-left:3px solid var(--np-accent-2);border-radius:6px;line-height:1.55}
.np-action{min-height:35px;border-radius:8px;font-size:12.5px;background:var(--np-panel)}
.np-action:hover{transform:translateY(-1px);box-shadow:0 4px 10px color-mix(in srgb,var(--np-accent) 15%,transparent);background:var(--np-accent-soft)}
.np-action.active{background:var(--np-accent-soft);box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--np-accent) 38%,transparent)}
.np-ai-footer{background:color-mix(in srgb,var(--np-panel) 82%,transparent);padding:9px 12px}
.np-ai-footer .np-btn{flex:0 0 auto}
.np-ai-review{width:430px;max-width:46%;background:linear-gradient(180deg,color-mix(in srgb,var(--np-panel) 84%,var(--np-accent) 16%),var(--np-panel) 42%)}
.np-changebar{display:flex;align-items:center;gap:6px;padding:7px 8px;margin-bottom:10px;border:1px solid color-mix(in srgb,var(--np-success) 25%,var(--np-border));border-radius:9px;background:color-mix(in srgb,var(--np-success-soft) 72%,var(--np-panel))}
.np-changebar-label{display:flex;align-items:center;gap:5px;flex:1;min-width:0;color:var(--np-success);font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-changebar .np-btn{padding:4px 7px;min-height:26px;font-size:11px}
.np-history-body{flex:1;min-height:0;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.np-history-item{border:1px solid var(--np-border);border-radius:9px;background:color-mix(in srgb,var(--np-panel) 84%,transparent);padding:9px}
.np-history-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.np-history-action{font-size:12px;font-weight:650;color:var(--np-text)}
.np-history-time{font-size:10.5px;color:var(--np-text-3);font-family:var(--np-mono)}
.np-history-meta{display:flex;gap:9px;align-items:center;color:var(--np-text-3);font-size:11px;margin-top:4px}
.np-history-actions{display:flex;gap:6px;justify-content:flex-end;margin-top:7px}
.np-review-head .np-diff-scope{margin-left:auto}
.np-review-head .np-btn{margin-left:auto}
.np-review-body{flex:1;min-height:0;overflow:auto;padding:11px 12px 8px;display:flex;flex-direction:column;gap:8px}
.np-review-meta{padding:2px 1px}
.np-review-hint{margin:0;font-size:11px}
.np-diff-dock{flex:0 1 auto;min-height:180px;max-height:calc(100vh - 360px);border:1px solid var(--np-border);border-radius:9px;background:var(--np-bg)}
.np-review-actions{border-top:1px solid var(--np-border);padding:10px 12px 12px;display:flex;flex-direction:column;gap:8px;background:color-mix(in srgb,var(--np-panel) 88%,transparent)}
.np-review-actions .np-row .np-primary{flex:1}
.np-selbox.unmapped{border-left-color:var(--np-warn);background:var(--np-warn-soft)}
.np-hint.np-warn{color:var(--np-warn)}
.np-preview-shell-html{background:#fff}
.np-html-preview{position:absolute;inset:0;background:var(--np-bg)}
.np-html-frame{position:absolute;inset:48px 0 0;width:100%;height:calc(100% - 48px);border:0;background:var(--np-bg)}
.np-preview-loading,.np-preview-error{position:absolute;z-index:8;left:50%;top:84px;transform:translateX(-50%);display:flex;align-items:center;gap:8px;padding:8px 12px;border-radius:9px;background:var(--np-panel);border:1px solid var(--np-border);box-shadow:0 8px 24px rgba(16,26,44,.12);font-size:12px;color:var(--np-text-2);max-width:80%}
.np-preview-error{color:var(--np-warn);border-color:color-mix(in srgb,var(--np-warn) 40%,var(--np-border))}
.np-image-menu{position:fixed;z-index:130;min-width:168px;padding:4px;border:1px solid var(--np-border-strong);border-radius:9px;background:var(--np-panel);box-shadow:0 12px 32px rgba(15,24,40,.24);animation:np-in .1s ease-out}
.np-image-menu-item{appearance:none;width:100%;display:flex;align-items:center;gap:8px;border:0;border-radius:6px;background:transparent;color:var(--np-text);font:inherit;font-size:12.5px;padding:7px 9px;text-align:left;cursor:pointer}
.np-image-menu-item:hover{background:var(--np-accent-soft);color:var(--np-accent)}
.np-empty{background:radial-gradient(720px 420px at 50% 36%,color-mix(in srgb,var(--np-accent) 12%,var(--np-bg)) 0%,var(--np-bg) 66%)}
.np-mark{width:78px;height:78px;border-radius:22px;background:var(--np-accent-gradient);color:#fff;box-shadow:0 18px 36px color-mix(in srgb,var(--np-accent) 28%,transparent);margin-bottom:20px}
.np-emptybox h2{font-size:23px;letter-spacing:-.02em;margin-bottom:8px}
.np-emptybox p{max-width:470px;font-size:13px;line-height:1.75}
.np-empty-actions .np-btn{min-height:34px;padding:7px 13px;border-radius:8px}
.np-features{display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin:0 0 19px}
.np-features span{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:color-mix(in srgb,var(--np-panel) 75%,transparent);border:1px solid var(--np-border);color:var(--np-text-2);font-size:11.5px}
.np-features svg{color:var(--np-accent-2)}
.np-recent{border-top:1px solid var(--np-border);padding-top:13px}
.np-recent-item{padding:6px 7px;border-radius:6px}
.np-floatbar{border-radius:10px;padding:4px;box-shadow:0 12px 30px rgba(18,28,48,.22);border-color:var(--np-border-strong)}
.np-floatbar .np-btn{border-radius:6px}
.np-modal{border-radius:16px;border-color:color-mix(in srgb,var(--np-border) 90%,var(--np-text-3));box-shadow:0 28px 80px rgba(12,20,36,.3)}
.np-modal-head{background:linear-gradient(180deg,color-mix(in srgb,var(--np-panel) 82%,var(--np-accent) 18%),var(--np-panel));padding:13px 16px}
.np-modal-title{font-size:14px}
.np-modal-foot{background:color-mix(in srgb,var(--np-panel) 94%,var(--np-panel-2))}
.np-settings{display:flex;flex-direction:column;gap:13px}
.np-settings-card{border:1px solid var(--np-border);border-radius:12px;background:color-mix(in srgb,var(--np-panel) 82%,transparent);padding:13px 14px;display:flex;flex-direction:column;gap:11px;box-shadow:0 1px 2px rgba(20,30,50,.03)}
.np-settings-card-head{display:flex;align-items:baseline;gap:10px;justify-content:space-between;padding-bottom:2px;border-bottom:1px solid color-mix(in srgb,var(--np-border) 65%,transparent);margin-bottom:1px}
.np-settings-card-head h3{font-size:13px;margin:0;font-weight:650}
.np-settings-card-head span{font-size:11px;color:var(--np-text-3)}
.np-settings-actions{display:flex;align-items:center;gap:9px;padding-top:2px}
.np-field-font{align-items:start}
.np-font-field-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:9px}
.np-font-picker{position:relative;width:100%}
.np-font-control{display:flex;align-items:center;min-height:37px;border:1px solid var(--np-border-strong);border-radius:9px;background:var(--np-bg);overflow:hidden;box-shadow:inset 0 1px 2px rgba(20,30,50,.04);transition:border-color .15s,box-shadow .15s}
.np-font-control:focus-within{border-color:var(--np-accent);box-shadow:0 0 0 3px color-mix(in srgb,var(--np-accent) 16%,transparent)}
.np-font-glyph{width:38px;align-self:stretch;display:grid;place-items:center;border-right:1px solid var(--np-border);background:linear-gradient(135deg,var(--np-accent-soft),color-mix(in srgb,var(--np-accent-2) 10%,var(--np-panel)));color:var(--np-accent);font-family:Georgia,serif;font-size:15px;font-weight:700;flex:none}
.np-font-input{flex:1;min-width:0;border:0;outline:none;background:transparent;padding:0 10px;height:36px;font-size:13px}
.np-font-toggle{appearance:none;border:0;background:transparent;color:var(--np-text-2);height:36px;width:36px;display:grid;place-items:center;flex:none;border-left:1px solid var(--np-border)}
.np-font-toggle:hover{background:var(--np-panel-2);color:var(--np-text)}
.np-font-popover{position:absolute;z-index:90;top:calc(100% + 6px);left:0;right:0;background:var(--np-panel);border:1px solid var(--np-border-strong);border-radius:11px;box-shadow:0 18px 48px rgba(16,26,44,.22);overflow:hidden;animation:np-in .13s ease-out}
.np-font-search{display:flex;align-items:center;gap:7px;padding:8px 9px;border-bottom:1px solid var(--np-border);color:var(--np-text-3)}
.np-font-search input{flex:1;min-width:0;border:0;outline:none;background:transparent;font-size:12.5px;color:var(--np-text);height:24px}
.np-font-clear{appearance:none;border:0;background:var(--np-panel-2);color:var(--np-text-3);border-radius:50%;width:19px;height:19px;display:grid;place-items:center;padding:0}
.np-font-list{max-height:252px;overflow:auto;padding:4px}
.np-font-option{appearance:none;width:100%;border:1px solid transparent;background:transparent;border-radius:7px;padding:6px 8px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 8px;text-align:left;color:var(--np-text);align-items:center}
.np-font-option:hover,.np-font-option.active{background:var(--np-panel-2);border-color:var(--np-border)}
.np-font-option.selected{background:var(--np-accent-soft);border-color:color-mix(in srgb,var(--np-accent) 30%,var(--np-border))}
.np-font-name{font-size:13px;line-height:1.35;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.np-font-option.selected .np-font-name{color:var(--np-accent);font-weight:600}
.np-font-sample{grid-row:2;grid-column:1;color:var(--np-text-3);font-size:11px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-font-star{grid-row:1 / span 2;grid-column:2;color:var(--np-warn);font-size:11px}
.np-font-empty{padding:24px 10px;text-align:center;color:var(--np-text-3);font-size:12px}
.np-font-foot{display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-top:1px solid var(--np-border);color:var(--np-text-3);font-size:10.5px;background:var(--np-panel-2)}
.np-font-refresh{appearance:none;border:0;background:transparent;color:var(--np-text-2);display:inline-flex;align-items:center;gap:4px;font-size:10.5px;padding:2px 4px;border-radius:4px}
.np-font-refresh:hover{background:var(--np-panel);color:var(--np-text)}
.np-font-preview{border:1px dashed var(--np-border-strong);border-radius:8px;padding:9px 11px;background:linear-gradient(135deg,color-mix(in srgb,var(--np-accent) 3%,var(--np-bg)),var(--np-bg));color:var(--np-text);line-height:1.35;display:flex;flex-direction:column;gap:2px;overflow:hidden}
.np-font-preview span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-font-preview small{font-size:.55em;color:var(--np-text-3);letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.np-preview-shell{position:absolute;inset:0;overflow:hidden;background:var(--np-bg)}
.np-preview{padding-top:60px!important;background:radial-gradient(100% 80% at 50% 0,color-mix(in srgb,var(--np-accent) 4%,var(--np-bg)) 0%,var(--np-bg) 50%)}
.np-preview > *{content-visibility:auto;contain-intrinsic-size:auto 1.8em}
.np-previewbar{position:absolute;z-index:7;top:12px;right:16px;left:16px;display:flex;align-items:center;justify-content:space-between;pointer-events:none}
.np-previewbar>*{pointer-events:auto}
.np-preview-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;background:color-mix(in srgb,var(--np-panel) 88%,transparent);border:1px solid var(--np-border);color:var(--np-text-2);font-size:11px;box-shadow:0 2px 8px rgba(20,30,50,.06);backdrop-filter:blur(6px)}
.np-preview-pill svg{color:var(--np-accent-2)}
.np-preview-edit{background:color-mix(in srgb,var(--np-panel) 90%,transparent);border:1px solid var(--np-border);border-radius:8px;padding:5px 8px;box-shadow:0 2px 8px rgba(20,30,50,.06);backdrop-filter:blur(6px)}
.np-preview-hint{position:absolute;z-index:6;right:18px;bottom:12px;padding:3px 8px;border-radius:999px;background:color-mix(in srgb,var(--np-panel) 80%,transparent);border:1px solid var(--np-border);color:var(--np-text-3);font-size:10.5px;pointer-events:none;backdrop-filter:blur(5px)}
.np-settings-page .np-settings-card{background:var(--np-panel)}
.np-settings-page{padding:22px 24px 30px;max-width:900px}
.np-settings-page h2{font-size:18px;letter-spacing:-.01em}
.np-settings-page>p{max-width:640px;line-height:1.65;margin-bottom:16px}
.np-about-tab{color:var(--np-text-2)}
.np-about-tab:hover{color:var(--np-accent)}
.np-about-modal{width:min(920px,96vw);max-height:92vh}
.np-about-body{padding:0 18px 20px}
.np-about-hero{display:flex;gap:15px;align-items:flex-start;margin:0 -18px 16px;padding:18px 20px;background:linear-gradient(135deg,color-mix(in srgb,var(--np-accent) 12%,var(--np-panel)),color-mix(in srgb,var(--np-accent-2) 9%,var(--np-panel)));border-bottom:1px solid var(--np-border)}
.np-about-mark{width:58px;height:58px;border-radius:16px;display:grid;place-items:center;background:var(--np-accent-gradient);color:#fff;box-shadow:0 10px 24px color-mix(in srgb,var(--np-accent) 30%,transparent);flex:none}
.np-about-hero-text{min-width:0;display:flex;flex-direction:column;gap:4px}
.np-about-name{font-size:23px;font-weight:750;letter-spacing:-.02em;line-height:1.15}
.np-about-tagline{margin:0;color:var(--np-text-2);font-size:12.5px}
.np-about-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:4px;color:var(--np-text-3);font-size:10.5px}
.np-about-meta>span{padding:2px 7px;border-radius:999px;background:color-mix(in srgb,var(--np-panel) 62%,transparent);border:1px solid var(--np-border)}
.np-about-version{color:var(--np-accent)!important;border-color:color-mix(in srgb,var(--np-accent) 30%,var(--np-border))!important;font-weight:700;font-family:var(--np-mono)}
.np-about-intro{margin:0 0 15px;color:var(--np-text-2);font-size:12.5px;line-height:1.75;max-width:780px}
.np-about-section{margin:0 0 15px}
.np-about-section h3{font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--np-text-3);margin:0 0 7px;font-weight:700}
.np-about-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}
.np-about-feature{display:flex;gap:8px;align-items:flex-start;padding:9px 9px;border:1px solid var(--np-border);border-radius:9px;background:color-mix(in srgb,var(--np-panel) 75%,transparent);min-width:0}
.np-about-ficon{width:27px;height:27px;border-radius:7px;display:grid;place-items:center;background:var(--np-accent-soft);color:var(--np-accent);flex:none}
.np-about-feature strong{display:block;font-size:11.5px;line-height:1.35;margin-bottom:1px;color:var(--np-text)}
.np-about-feature p{margin:0;font-size:10.5px;line-height:1.45;color:var(--np-text-3)}
.np-about-columns{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}
.np-about-shortcuts{display:grid;grid-template-columns:1fr 1fr;gap:4px 12px}
.np-about-shortcut{display:flex;align-items:center;gap:6px;min-width:0}
.np-about-shortcut .np-kbd{flex:none;font-size:9.5px;padding:1px 4px}
.np-about-shortcut span{font-size:11px;color:var(--np-text-2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.np-about-runtime{display:flex;flex-direction:column;gap:5px}
.np-about-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;font-size:11.5px;color:var(--np-text-3);border-bottom:1px dashed color-mix(in srgb,var(--np-border) 70%,transparent);padding-bottom:4px}
.np-about-row b{font-weight:500;color:var(--np-text-2);text-align:right;max-width:68%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.np-about-updates{display:flex;flex-direction:column;gap:5px}
.np-about-updates p{margin:0;display:flex;gap:7px;align-items:flex-start;font-size:11.5px;line-height:1.55;color:var(--np-text-2)}
.np-about-dot{width:6px;height:6px;border-radius:50%;background:var(--np-accent-gradient);flex:none;margin-top:5px}
.np-about-limits{border:1px solid var(--np-border);border-radius:9px;padding:9px 11px;background:color-mix(in srgb,var(--np-warn) 5%,var(--np-panel))}
.np-about-limits ul{margin:0;padding-left:16px;color:var(--np-text-2);font-size:11px;line-height:1.65}
.np-about-limits li{margin:2px 0}
@media (max-width:820px){
  .np-about-grid{grid-template-columns:1fr 1fr}
  .np-about-columns{grid-template-columns:1fr;gap:0}
}
@media (max-width:980px){
  .np-brand-text{display:none}
  .np-ai{width:310px;min-width:270px}
}
@media (max-width:760px){
  .np-save span{display:none}
  .np-statusbar{gap:9px;font-size:11px}
  .np-zoom-stat{display:none}
  .np-previewbar{left:10px;right:10px}
  .np-preview-hint{display:none}
}
@keyframes np-pop{from{opacity:0;transform:translateY(-3px) scale(.99)}to{opacity:1;transform:none}}
.np-font-popover{animation:np-pop .14s ease-out}
`
