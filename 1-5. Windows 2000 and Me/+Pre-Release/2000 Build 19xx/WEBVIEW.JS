
		// THIS SCRIPT IS COMMON FOR ALL CUSTOM WEB VIEWS

		var L_Prompt_Text         = "Select an item to view its description.";
		var L_Empty_Text          = "There are no items to show in this folder.";
		var L_Multiple_Text       = " items selected.";
		var L_Size_Text           = "Size: ";
		var L_FileSize_Text       = "Total File Size: ";
		var L_Delimiter_Text      = ",";
		var L_Bytes_Text          = "&nbsp;bytes";
		var L_Properties_Text     = "P&roperties";
		var L_Today_Text          = "Today at";
		var L_Yesterday_Text      = "Yesterday at";
		var L_Preview_Text        = "Generating preview...";
		var L_TotalSize_Text      = "Capacity: ";
		var L_UsedSpace_Text      = "Used: ";
		var L_FreeSpace_Text      = "Free: ";
		var L_Attributes_Text     = "Attributes";
		var L_Codes_Text          = "RHSaCE"; // suppress the Archive flag
		var L_ReadOnly_Text       = "Read-only";
		var L_Hidden_Text         = "Hidden";
		var L_System_Text         = "System";
		var L_Archive_Text        = "Archive";
		var L_Compressed_Text     = "Compressed";
		var L_Encrypted_Text      = "Encrypted";
		var L_NoAttributes_Text   = "(normal)";
		var gAttributeNames       = new Array(L_ReadOnly_Text, L_Hidden_Text, L_System_Text, L_Archive_Text, L_Compressed_Text, L_Encrypted_Text);
		var gIntroText            = "";
		var gTimer                = 0;
		var gWantMedia            = false; // cool, but may hinder media file manipulation
		var gDoBlends             = false && (navigator.cpuClass != "Alpha" && screen.colorDepth > 8);
		var gToday;
		var gYesterday;
		var gFolder;
		var gFolderPath;
		var gFoundAuthor;

		function FormatDetail(label, data) {
			var s;
			if (label.length + data.length > 32)
				s = "<p>" + label + ":<br>" + data;
			else
				s = "<p>" + label + ": " + data;
			return s;
		}

		function ShowInfo() {
			// updates the left info panel when you select icons
			var item;
			var name;
			var data;
			var text;
			var title;
			var size = 0;
			var i;

			if (gDoBlends) {
				Panel.filters.blendTrans.Stop();
				Panel.filters.blendTrans.Apply();
			}

			// kill any preview
			Preview.innerHTML = "";
			Preview.style.display = "none";
			Thumbnail.style.height = 120;
			Thumbnail.style.display = "none";

			data = FileList.SelectedItems().Count;
			if (data == 0)
				text = NoneSelected();
			else if (data > 1)
				text = ManySelected(data);
			else {
				item = FileList.SelectedItems().Item(0);

				// name
				name = FileList.Folder.GetDetailsOf(item, 0);
				if (!name)
					name = item.Name;
				if (IsBrowsable(item))
					text = "<b>" + name.link(item.Path) + "</b>";
				else
					text = "<b>" + name + "</b>";
				if (false && IsFileLocked(FileList.Folder.GetDetailsOf(item, 4)))
					text += "&nbsp;&nbsp;<img id=Locked src='res://webview.dll/Locked.gif'>";

				// type
				data = FileList.Folder.GetDetailsOf(item, 2);
				if (data)
					text += "<br>" + data;

				// date
				text += HandleDate(item);

				// size
				text += HandleSize(item);

				// extra details?
				gFoundAuthor = false;
				for (i = 4; i < 10; i++) {
					title = FileList.Folder.GetDetailsOf(null, i);
					if (!title)
						break;
					data = FileList.Folder.GetDetailsOf(item, i);
					if (title == L_Attributes_Text)
						text += "<p>" + title + ": " + FormatAttributes(data);
					else if (data) {
						if (title == "Author") {
							gFoundAuthor = true;
							text += "<p>" + title + ": <a href='mailto:" + data + "'>" + data + "</a>";
						} else
							text += FormatDetail(title, data);
					}
				}

				// comment?
				text += HandleComment(item);

				// try to generate a new thumbnail or media preview
				if (item.Size)
					if (Thumbnail.displayFile(item.Path))
						gTimer = window.setTimeout('Preview.innerHTML = "<br>" + L_Preview_Text; Preview.style.display = ""', 1000);
					else if (gWantMedia) {
						ext = GetFileExtension(name);
						if (IsMovieFile(ext))
							Preview.innerHTML = '<p><object class=Movie classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95"><param name="FileName" value="' + item.Path + '"><param name=ShowDisplay value=0><param name=AutoPlay value=0></object>';
						else if (IsSoundFile(ext))
							Preview.innerHTML = '<p><object class=Sound classid="clsid:22D6F312-B0F6-11D0-94AB-0080C74C7E95"><param name="FileName" value="' + item.Path + '"><param name=ShowDisplay value=0><param name=AutoPlay value=0></object>';
						if (Preview.innerHTML != "")
							Preview.style.display = "";
					}
			}
			// replace Info with the new text
			Info.innerHTML = text;
			if (gDoBlends)
				Panel.filters.blendTrans.Play();
		}

		function FormatNumber(n) {
			var s = "";
			var i, j = 0;
			for (i = n.length - 1; i >= 0; i--) {
				s = n.charAt(i) + s;
				if (i && ((++j % 3) == 0))
					s = L_Delimiter_Text + s;
			}
			return s;
		}

		function HandleSize(item) {
			var s = "";
			var size = item.Size;
			if (size && size < 1000)
				s = "<p>" + L_Size_Text + size + L_Bytes_Text;
			else {
				var data = FileList.Folder.GetDetailsOf(item, 1);
				if (data)
					s = "<p>" + FileList.Folder.GetDetailsOf(null, 1) + ": " + data;
				else if (size)
					s = "<p>" + L_Size_Text + FormatNumber(size.toString()) + L_Bytes_Text;
			}
			return s;
		}

		function FormatDate(s) {
			var d = new Date(s);
			d = d.toLocaleString();
			d = d.substring(0, d.indexOf(' '));
			if (d == gToday || d == gYesterday) {
				var sTime = s.substring(s.indexOf(' '), s.length);
				if (d == gToday)
					s = L_Today_Text + sTime;
				else
					s = L_Yesterday_Text + sTime;
			}
			return s;
		}

		function HandleDate(item) {
			var s = "";
			var data = FileList.Folder.GetDetailsOf(item, 3);
			if (data) 
				s = "<p>" + FileList.Folder.GetDetailsOf(null, 3) + ": " + FormatDate(data);
			return s;
		}

		function FormatAttributes(data) {
			var s = "";
			var code;
			for (i = 0; i < L_Codes_Text.length; i++) {
				code = L_Codes_Text.charAt(i);
				if (data.indexOf(code) > -1) {
					if (s)
						s += ", ";
					s += gAttributeNames[i];
				}
			}
			if (!s)
				s = L_NoAttributes_Text;
			return s;
		}

		function FormatComment(data) {
			var s = "";
			if (data) {
				var start;
				var end;
				var theLink;
				var a = data.split("\n");
				var L_Author_Text = "Author: ";

				// look for a contact
				for (var i in a) {
					start = a[i].indexOf(L_Author_Text);
					if (start < 0)
						continue;
					if (gFoundAuthor) // already in Details column
						a[i] = "";
					else {
						start += L_Author_Text.length;
						end = a[i].length;
						theLink = data.substring(start, end);
						a[i] = L_Author_Text + "<a href='mailto:" + theLink + "'>" + theLink + "</a>";
					}
				}

				// parse lines for Office files without breaking links below
				data = a.join("<br>\n");
				// look for embedded links
				start = data.indexOf("http://");
				if (start < 0)
					start = data.indexOf("file://");
				if (start < 0)
					s += data;
				else {
					end = data.indexOf(" ", start);
					if (end < 0)
						end = data.length;
					if (start > 0)
						s += data.substring(0, start - 1);
					theLink = data.substring(start, end);
					s += theLink.link(theLink);
					if (end < data.length)
						s += data.substring(end + 1, data.length);
				}
			}
			return s;
		}

		function HandleComment(item) {
				var s = "";
				var data = FileList.Folder.GetDetailsOf(item, -1);
				if (data && data != item.Name)
					s = "<p>" + FormatComment(data);
				return s;
		}

		function Properties() {
			FileList.SelectedItems().Item(0).InvokeVerb(L_Properties_Text);
		}

		function GetFileExtension(name) {
			var ext = name.substring(name.lastIndexOf(".") + 1, name.length);
			return ext.toLowerCase();		
		}

		function IsBrowsable(item) {
			if (item.IsBrowsable || item.IsFolder)
				return true;
			var ext = GetFileExtension(item.Path);
			var types = "gif,jpg,htm,txt,rtf"
			return types.indexOf(ext) > -1;
		}

		function IsMovieFile(ext) {
			var types = "avi,mov,qt,mpe,mpeg,mpg";
			return types.indexOf(ext) > -1;
		}

		function IsSoundFile(ext) {
			var types = "aif,aifc,aiff,au,mid,rmi,snd,wav";
			return types.indexOf(ext) > -1;
		}

		function IsFileLocked(name) {
			return (name.indexOf(L_Codes_Text.charAt(0)) > -1);
		}

		function NoneSelected() {
//			var s = gIntroText + (FileList.Folder.Items().Count ? L_Prompt_Text : L_Empty_Text); Bug #197686
                        var s = gIntroText + L_Prompt_Text;

			if (false || gFolderPath.length == 4) { // true allows all subfolders to show the pie chart
				drive = gFolderPath.substring(0, 3);
				if (Thumbnail.displayFile(drive)) {
					if (gFolderPath.length == 4)
						s += "<p><br>" + L_TotalSize_Text + Thumbnail.totalSpace + "<p>";
					else
						s += "<p><br>" + drive.link(drive) + "<p><p>" + L_TotalSize_Text + Thumbnail.totalSpace;
					s += "<p><table class=Legend width=12 height=12 border=1 align=left bgcolor=threedface bordercolordark=black bordercolorlight=black><tr><td></td></tr></table>&nbsp;" + L_UsedSpace_Text + Thumbnail.usedSpace;
					s += "<p><table class=Legend width=12 height=12 border=1 align=left bgcolor=threedhighlight width=12 height=12 border=1 align=left bordercolordark=black bordercolorlight=black><tr><td></td></tr></table>&nbsp;" + L_FreeSpace_Text + Thumbnail.freeSpace;
					//Thumbnail.style.height = 60; bug 195578
					Thumbnail.style.display = "";
				}
			}
			return s;
		}

		function ManySelected(items) {
			var s = items + L_Multiple_Text + "<p>";
			var size = 0;
			if (items <= 100) {
				for (var i = 0; i < items; i++)
					size += FileList.SelectedItems().Item(i).Size;
				if (size)
					s += L_FileSize_Text + FormatNumber(size.toString()) + L_Bytes_Text + "<p>";
				if (items <= 16)
					for (i = 0; i < items; i++)
						s += FileList.SelectedItems().Item(i).Name + "<br>";
			}
			return s;
		}

		// EVENTS

		function Resize() {
			if (document.body.clientWidth < Panel.style.pixelWidth * 2) {
				Panel.style.visibility = "hidden";
				FileList.style.pixelLeft = 0;
			} else {
				Panel.style.visibility = "visible";
				FileList.style.pixelLeft = Panel.style.pixelWidth;
			}
			FileList.style.pixelWidth = document.body.clientWidth - FileList.style.pixelLeft;
		}

		function ThumbnailReady() {
			window.clearTimeout(gTimer);
			Preview.innerHTML = "";
			Preview.style.display = "none";
			if (Thumbnail.haveThumbnail())
				Thumbnail.style.display = "";
		}

		// INITIALIZATION

		function Initialize(introText) {
			gIntroText = introText;
			gFolder = FileList.Folder;
			gFolderPath = Info.innerHTML;
			Info.innerHTML = NoneSelected();

			// fix styles
			var L_SystemFont1_Text = "MS Sans Serif";
			var L_SystemFont2_Text = "MS Shell Dlg";
			var L_SystemFont_Text = "Tahoma, Verdana";
			var tr = document.body.createTextRange();
			if (navigator.cpuClass != "Alpha") {
				tr.collapse();
				var actualFont = tr.queryCommandValue("FontName");
				if (actualFont == L_SystemFont1_Text || actualFont == L_SystemFont2_Text)
					document.body.style.fontFamily = L_SystemFont_Text;
			} else
				document.body.style.fontFamily = L_SystemFont_Text;

			// init relative dates
			gToday = new Date();
			gToday = gToday.toLocaleString();
			gToday = gToday.substring(0, gToday.indexOf(' '));
			gYesterday = new Date(Date.parse(gToday) - (1000 * 60 * 60 * 24));
			gYesterday = gYesterday.toLocaleString();
			gYesterday = gYesterday.substring(0, gYesterday.indexOf(' '));

			// call our Resize() function whenever the window gets resized
			window.onresize = Resize;
		}
