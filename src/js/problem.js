var $submit_block = $('#submit_block');
var $lang = $submit_block.find('#lang');
var $file = $submit_block.find('#file');
var $error = $submit_block.find('#error');
var $submit = $submit_block.find('#submit');
var $ui = $submit_block.find('.upload_info');
var $alert = $submit_block.find('#alert');
var $alert_close = $alert.find('.close');

var $tag_block = $('#tag_block');
var $add_tag = $tag_block.find('#add-tag');
var $selectdiv = $tag_block.find('#tag_select');
var $select = $selectdiv.find('select');
var $del_tag = $tag_block.find('span.del');
var $tag_box = $tag_block.find('.tag-box');

$(document).ready(function() {
  $alert_close.click(function(){
    $alert.slideUp();
  });
  $submit.click(function() {
    if (!$file.val()) {
      errAnimate($error, 'Please choose file!');
      return false;
    }
  });
  $file.fileupload({
    dataType: 'json',
    add: function(e, data) {
      var f = data.files[0];
      $ui.removeClass('user-green').text(f.name);
      $submit.unbind('click');
      $submit.click(function(){
        if (f.size) {
          if (f.size < 50) {
            errAnimate($error, 'too small. (<50B)');
            return false;
          } else if (f.size > 65535) {
            errAnimate($error, 'too large. (>65535B)');
            return false;
          }
        }
        $error.text('');
        data.submit();
      });
    },
    progress: function(e, data) {
      var p = parseInt(data.loaded/data.total*100, 10);
      $ui.addClass('user-green').text(p+'%');
    },
    done: function(e, data) {
      var res = data.response().result;
      var ret = res.ret;
      if (ret === 0) {
        window.location.href = '/status';
      }
      else if (ret === -7) {
        $alert.slideDown();
      } else {
        errAnimate($error, res.msg);
      }
    }
  });
  $file.bind('fileuploadsubmit', function(e, data){
    data.formData = { lang: $lang.val() };
    if ($alert.is(':visible')) {
      data.formData.ignore_i64 = true;
    }
  });
});

$(document).ready(function(){
  if ($add_tag.length) {
    $add_tag.unbind(); $del_tag.unbind();
    $add_tag.click(function(){
      $(this).addClass('hidden');
      $selectdiv.removeClass('hidden');
      $select.change(function(res){
        $.ajax({
          type: 'POST',
          url: '/problem/editTag',
          data: {
            tag: $(this).val(),
            pid: pid,
            add: true
          },
          dataType: 'json'
        }).done(function(res){
          var ret = res.ret;
          if (ret === 0) {
            window.location.reload(true);
          } else {
            ShowMessage(res.msg);
          }
        });
      });
    });
    $del_tag.click(function(){
      $.ajax({
        type: 'POST',
        url: '/problem/editTag',
        data: {
          tag: $(this).attr('tag'),
          pid: pid
        },
        dataType: 'json'
      }).done(function(res){
        var ret = res.ret;
        if (ret === 0) {
          window.location.reload(true);
        } else {
          ShowMessage(res.msg);
        }
      });
    });
  }
});

var $rejudge = $('#rejudge');

$(document).ready(function(){
  if ($rejudge.length) {
    $rejudge.click(function(){
      if ($(this).hasClass('disabled') || !confirm('rejudge会给用户带来较大影响，确定要rejudge？')) {
        return false;
      }
      $rejudge.addClass('disabled');
      $.ajax({
        type: 'POST',
        url: '/rejudge/problem',
        data: { pid : pid },
        dataType: 'text',
        error: function() {
          $rejudge.removeClass('disabled');
          ShowMessage('无法连接到服务器！');
        }
      }).done(function(){
        window.location.href = '/status?pid='+pid;
      });
    });
  }
});

var $phide = $('#phide');

$(document).ready(function(){
  if ($phide.length) {
    $phide.change(function(){
      $.ajax({
        type: 'POST',
        url: '/problem/toggleHide',
        data: {pid: pid},
        dataType: 'json'
      }).done(function(res){
        ShowMessage(res.msg);
      });
    });
  }
});

var $edit_btn = $('#edit_btn');

$(document).ready(function(){
  if ($edit_btn.length) {
    bindChange();
  }
});
